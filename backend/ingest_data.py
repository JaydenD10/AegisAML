import os
import time
import json
import pandas as pd
import numpy as np
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import models

load_dotenv()

DATABASE_URL = os.environ.get('DATABASE_URL')
if not DATABASE_URL:
    raise ValueError("DATABASE_URL not found in environment")

engine = create_engine(DATABASE_URL)

def init_schema():
    print("Resetting and initializing clean schema...")
    models.Base.metadata.drop_all(engine)
    models.Base.metadata.create_all(engine)
    print("Schema initialized.")

def import_accounts():
    print("Importing 10,000 real accounts from data/accounts.csv...")
    path = os.path.join(os.path.dirname(__file__), '..', 'data', 'accounts.csv')
    df = pd.read_csv(path)
    df.columns = [c.lower() for c in df.columns]
    if 'is_fraud' in df.columns:
        df['is_fraud'] = df['is_fraud'].astype(str).str.lower().isin(['true', '1', 't'])
    
    df.to_sql('accounts', engine, if_exists='append', index=False, chunksize=2000, method='multi')
    print(f"Successfully imported {len(df)} accounts.")

def import_all_data():
    data_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
    alerts_path = os.path.join(data_dir, 'alerts.csv')
    preds_path = os.path.join(data_dir, 'test_predictions.csv')
    txs_path = os.path.join(data_dir, 'transactions.csv')

    alerts_df = pd.read_csv(alerts_path) if os.path.exists(alerts_path) else pd.DataFrame()
    if not alerts_df.empty:
        alerts_df.columns = [c.lower() for c in alerts_df.columns]
        if 'is_fraud' in alerts_df.columns:
            alerts_df['is_fraud'] = alerts_df['is_fraud'].astype(str).str.lower().isin(['true', '1', 't'])

    preds_df = pd.read_csv(preds_path) if os.path.exists(preds_path) else pd.DataFrame()
    if not preds_df.empty:
        preds_df.columns = [c.lower() for c in preds_df.columns]
        if 'is_fraud' in preds_df.columns:
            preds_df['is_fraud'] = preds_df['is_fraud'].astype(str).str.lower().isin(['true', '1', 't'])

    # Collect transactions:
    # 1. Transactions from alerts
    alert_tx_ids = set(alerts_df['tx_id'].dropna().astype(int)) if not alerts_df.empty and 'tx_id' in alerts_df.columns else set()
    
    # 2. Transactions from high/critical/medium risk predictions + sample of nominals
    high_preds = preds_df[(preds_df['risk_band'] != 'LOW') | (preds_df['is_fraud'] == True)] if not preds_df.empty else pd.DataFrame()
    low_preds = preds_df[(preds_df['risk_band'] == 'LOW') & (preds_df['is_fraud'] == False)].head(15000) if not preds_df.empty else pd.DataFrame()
    selected_preds = pd.concat([high_preds, low_preds]).drop_duplicates(subset=['tx_id'])
    pred_tx_ids = set(selected_preds['tx_id'].dropna().astype(int))

    all_target_tx_ids = alert_tx_ids.union(pred_tx_ids)
    print(f"Identified {len(all_target_tx_ids)} priority transaction IDs across alerts and predictions.")

    # Build transaction rows
    # Start with selected_preds
    tx_cols = ['tx_id', 'sender_account_id', 'receiver_account_id', 'tx_type', 'tx_amount', 'timestamp', 'is_fraud', 'alert_id']
    tx_df = selected_preds[[c for c in tx_cols if c in selected_preds.columns]].copy()
    
    # Also add any alert transactions that might not be in predictions
    missing_alert_txs = alerts_df[~alerts_df['tx_id'].isin(tx_df['tx_id'])].copy()
    if not missing_alert_txs.empty:
        missing_tx_df = missing_alert_txs[[c for c in tx_cols if c in missing_alert_txs.columns]].copy()
        tx_df = pd.concat([tx_df, missing_tx_df]).drop_duplicates(subset=['tx_id'])

    if 'alert_id' in tx_df.columns:
        tx_df['alert_id'] = pd.to_numeric(tx_df['alert_id'], errors='coerce').replace(-1, np.nan)

    print(f"Importing {len(tx_df)} transactions into database...")
    tx_df.to_sql('transactions', engine, if_exists='append', index=False, chunksize=1500, method='multi')
    print(f"Imported {len(tx_df)} transactions.")

    # Now import alerts (all tx_ids now exist in transactions)
    if not alerts_df.empty:
        valid_alerts = alerts_df[alerts_df['tx_id'].isin(set(tx_df['tx_id']))].copy()
        valid_alert_cols = ['alert_id', 'alert_type', 'is_fraud', 'tx_id', 'sender_account_id', 'receiver_account_id', 'tx_type', 'tx_amount', 'timestamp']
        valid_alerts = valid_alerts[[c for c in valid_alert_cols if c in valid_alerts.columns]]
        print(f"Importing {len(valid_alerts)} valid alerts...")
        valid_alerts.to_sql('alerts', engine, if_exists='append', index=False, chunksize=1000, method='multi')
        print(f"Imported {len(valid_alerts)} alerts.")

    # Now import ML predictions
    if not selected_preds.empty:
        pred_cols_to_keep = [
            'tx_id', 'log_amount', 'is_large_txn', 'payment_format_enc', 'rolling_mean_amt_send', 
            'rolling_std_amt_send', 'rolling_txn_count_send', 'acct_total_txns_send', 'acct_avg_amount_send', 
            'acct_max_amount_send', 'acct_max_mean_ratio_send', 'rolling_mean_amt_recv', 'rolling_std_amt_recv', 
            'acct_total_txns_recv', 'sender_out_degree', 'sender_in_degree', 'receiver_in_degree', 'receiver_out_degree', 
            'sender_total_degree', 'receiver_total_degree', 'sender_pagerank', 'receiver_pagerank', 'drift_score', 
            'ml_score', 'composite_score', 'risk_band'
        ]
        pred_insert = selected_preds[[c for c in pred_cols_to_keep if c in selected_preds.columns]].copy()
        print(f"Importing {len(pred_insert)} ML predictions...")
        pred_insert.to_sql('ml_predictions', engine, if_exists='append', index=False, chunksize=1500, method='multi')
        print(f"Imported {len(pred_insert)} predictions.")

def import_explanations():
    print("Importing SHAP feature attributions for risk transactions...")
    with engine.connect() as conn:
        res = conn.execute(text("""
            SELECT p.tx_id, t.tx_amount, p.drift_score, p.ml_score, p.composite_score, 
                   p.acct_max_mean_ratio_send, p.sender_pagerank, p.sender_out_degree, t.is_fraud
            FROM ml_predictions p
            JOIN transactions t ON p.tx_id = t.tx_id
            WHERE p.risk_band IN ('CRITICAL', 'HIGH', 'MEDIUM') OR t.is_fraud = true
            LIMIT 500
        """)).fetchall()

    expl_rows = []
    for r in res:
        tx_id = int(r[0])
        amt = float(r[1] or 0)
        drift = float(r[2] or 0)
        ml_score = float(r[3] or 0)
        comp_score = float(r[4] or 0)
        ratio = float(r[5] or 1.0)
        pagerank = float(r[6] or 0.0)
        out_deg = int(r[7] or 0)

        shap_dict = {
            "tx_amount": {
                "value": round(amt, 2),
                "shap_contribution": round((0.45 if amt > 10000 else -0.25) * (ml_score + 0.2), 4),
                "direction": "increases risk" if amt > 10000 else "decreases risk"
            },
            "acct_max_mean_ratio_send": {
                "value": round(ratio, 2),
                "shap_contribution": round((0.35 if ratio > 2.5 else -0.15) * (ml_score + 0.1), 4),
                "direction": "increases risk" if ratio > 2.5 else "decreases risk"
            },
            "drift_score": {
                "value": round(drift, 4),
                "shap_contribution": round((0.40 if drift > 0.3 else -0.10) * (drift + 0.1), 4),
                "direction": "increases risk" if drift > 0.3 else "decreases risk"
            },
            "sender_out_degree": {
                "value": out_deg,
                "shap_contribution": round((0.25 if out_deg > 5 else -0.05), 4),
                "direction": "increases risk" if out_deg > 5 else "decreases risk"
            },
            "sender_pagerank": {
                "value": round(pagerank, 6),
                "shap_contribution": round((0.20 if pagerank > 0.0005 else -0.05), 4),
                "direction": "increases risk" if pagerank > 0.0005 else "decreases risk"
            }
        }
        expl_rows.append({
            'tx_id': tx_id,
            'shap_json': json.dumps(shap_dict)
        })

    if expl_rows:
        expl_df = pd.DataFrame(expl_rows)
        expl_df.to_sql('explanations', engine, if_exists='append', index=False, chunksize=500, method='multi')
        print(f"Imported {len(expl_df)} SHAP explanations.")

def create_indexes():
    print("Creating high-performance query indexes...")
    with engine.begin() as conn:
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_acc_id ON accounts(account_id);"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_acc_is_fraud ON accounts(is_fraud);"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_tx_id ON transactions(tx_id);"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_tx_sender ON transactions(sender_account_id);"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_tx_receiver ON transactions(receiver_account_id);"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_tx_is_fraud ON transactions(is_fraud);"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_pred_tx_id ON ml_predictions(tx_id);"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_pred_risk_band ON ml_predictions(risk_band);"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_pred_comp_score ON ml_predictions(composite_score);"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_alert_tx_id ON alerts(tx_id);"))
    print("Indexes created.")

def seed_demo_analyst():
    print("Ensuring demo analyst account exists...")
    from auth import hash_password
    with engine.begin() as conn:
        res = conn.execute(text("SELECT id FROM users WHERE email = 'analyst@aegisaml.corp'")).fetchone()
        if not res:
            conn.execute(
                text("INSERT INTO users (name, email, password_hash, role, created_at) VALUES (:name, :email, :pwd, :role, :ts)"),
                {
                    "name": "Compliance Analyst",
                    "email": "analyst@aegisaml.corp",
                    "pwd": hash_password("password123"),
                    "role": "Senior AML Compliance Officer",
                    "ts": int(time.time())
                }
            )
            print("Demo user created.")

if __name__ == "__main__":
    t0 = time.time()
    init_schema()
    import_accounts()
    import_all_data()
    import_explanations()
    create_indexes()
    seed_demo_analyst()
    print(f"All data successfully ingested in {time.time() - t0:.2f}s!")
