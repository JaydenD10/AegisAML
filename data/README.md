# AegisAML - Dataset & Benchmark Directory

This directory contains reference datasets, schemas, and explanation artifacts for the **AegisAML (Anti-Money Laundering)** surveillance platform.

---

## Directory Overview

| File | Type | Size | Description |
|---|---|---|---|
| `accounts.csv` | Synthetic Data | ~326 KB | Reference registry of 10,000 banking accounts with risk flags, customer IDs, initial balances, and country codes. |
| `alerts.csv` | Synthetic Data | ~88 KB | Pre-configured compliance alerts associated with flagged high-risk accounts and transactions. |
| `sample_transactions.csv` | Synthetic Data | ~8 KB | 100 sample transactions for immediate local testing, API verification, and ingestion testing. |
| `sample_explanation.json` | JSON Artifact | ~4 KB | Serialized TreeExplainer SHAP local attribution dictionary demonstrating feature-level risk drivers. |

---

## Dataset Schema Specifications

### 1. `accounts.csv`
| Column | Type | Example | Description |
|---|---|---|---|
| `ACCOUNT_ID` | Integer | `5295` | Unique internal banking identifier for the account |
| `CUSTOMER_ID` | String | `CUST-5295` | External KYC entity/customer identifier |
| `INIT_BALANCE` | Float | `10000.0` | Initial ledger balance |
| `COUNTRY` | String (ISO) | `US` | Jurisdiction code of account holder |
| `ACCOUNT_TYPE` | String | `STANDARD` | Account tier (`STANDARD`, `PREMIUM`, `CORPORATE`) |
| `IS_FRAUD` | Boolean | `false` | Ground truth historical laundering label |
| `TX_BEHAVIOR_ID`| Integer | `1` | Behavioral cluster persona identifier |

### 2. `transactions.csv` & `sample_transactions.csv`
| Column | Type | Example | Description |
|---|---|---|---|
| `TX_ID` | Integer | `101` | Unique transaction sequence identifier |
| `SENDER_ACCOUNT_ID` | Integer | `501` | Source / originator account identifier |
| `RECEIVER_ACCOUNT_ID` | Integer | `502` | Destination / beneficiary account identifier |
| `TX_TYPE` | String | `TRANSFER` | Payment rail (`TRANSFER`, `PAYMENT`, `WIRE`, `CASH_WITHDRAWAL`) |
| `TX_AMOUNT` | Float | `15000.00` | Fiat currency transaction amount |
| `TIMESTAMP` | Integer | `1700000000` | Unix epoch timestamp of execution |
| `IS_FRAUD` | Boolean | `false` | True laundering label (supervised training) |
| `ALERT_ID` | Integer / Null | `None` | Pre-existing compliance alert cross-reference |

---

## Large Benchmark Datasets (>50 MB)

To comply with Git and GitHub repository storage constraints, large raw production datasets (`transactions.csv`, ~61 MB; `test_predictions.csv`, ~108 MB; `processed_transactions.csv`, ~290 MB) are excluded via `.gitignore`.

### Regenerating or Ingesting Benchmark Data:
1. **Direct Web Dashboard Upload**:
   Navigate to the AegisAML Dashboard at `http://localhost:3000/upload` and upload `sample_transactions.csv` or any custom enterprise CSV. The ingestion engine automatically validates schema mappings, computes behavioral features, evaluates drift, runs ML inference, and persists the results.
2. **Feature Engineering Pipeline**:
   Run the offline feature engineering pipeline on your dataset:
   ```bash
   python preprocess.py
   ```
3. **Model Retraining & SHAP Extraction**:
   Train the ensemble model and produce predictions:
   ```bash
   python train.py
   ```
