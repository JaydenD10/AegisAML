# AegisAML - Next-Generation Anti-Money Laundering Surveillance Platform

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black.svg?style=flat&logo=next.js)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791.svg?style=flat&logo=postgresql)](https://www.postgresql.org)
[![Python 3.11+](https://img.shields.io/badge/Python-3.11%2B-blue.svg?logo=python)](https://python.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue.svg?logo=typescript)](https://www.typescriptlang.org)

**AegisAML** is an enterprise-grade Anti-Money Laundering (AML) surveillance, fraud detection, and explainable forensic investigation platform. Engineered for compliance teams, financial crime analysts, and forensic investigators, AegisAML bridges the divide between complex machine learning detection models and human-interpretable investigation workflows.

---

## Table of Contents

- [1. Executive Summary](#1-executive-summary)
- [2. Core Objectives](#2-core-objectives)
- [3. Key Features & Capabilities](#3-key-features--capabilities)
- [4. Technology Stack](#4-technology-stack)
- [5. System Architecture](#5-system-architecture)
- [6. Machine Learning & Explainable AI](#6-machine-learning--explainable-ai)
- [7. Behavioral Drift Detection Engine](#7-behavioral-drift-detection-engine)
- [8. Repository Folder Structure](#8-repository-folder-structure)
- [9. Prerequisites & Installation](#9-prerequisites--installation)
- [10. Environment Variable Configuration](#10-environment-variable-configuration)
- [11. Running AegisAML Locally](#11-running-aegisaml-locally)
- [12. Running with Docker & Docker Compose](#12-running-with-docker--docker-compose)
- [13. Database Schema & Migrations](#13-database-schema--migrations)
- [14. API Documentation & Endpoints](#14-api-documentation--endpoints)
- [15. Visual Interface & Screenshots](#15-visual-interface--screenshots)
- [16. Security & Compliance Safeguards](#16-security--compliance-safeguards)
- [17. Roadmap & Future Improvements](#17-roadmap--future-improvements)

---

## 1. Executive Summary

Modern financial crime involves sophisticated smurfing, structuring, layered fund flows, and rapidly mutating behavioral patterns designed to bypass legacy rule-based threshold filters. AegisAML combines **real-time statistical drift detection**, **graph-based network forensics (PageRank and degree distribution)**, **gradient-boosted ensemble ML scoring**, and **local SHAP feature attribution** into an intuitive analyst command center.

---

## 2. Core Objectives

- **Eliminate False Positives**: Transition from rigid threshold rules to multi-layered composite risk scores (70% ML Ensemble + 30% Temporal Behavioral Drift).
- **Explainable Decisions**: Provide transparent SHAP (TreeExplainer) explanations and DiCE counterfactuals showing exact risk-increasing and risk-decreasing drivers for every alert.
- **Topological Financial Graphing**: Uncover hidden money mules and laundering rings via interactive directed subgraphs, out-degree fan-outs, and PageRank rankings.
- **Continuous Drift Surveillance**: Monitor account activity in real time with Page-Hinkley, CUSUM, and rolling Z-score detectors to catch abrupt structural behavior shifts.
- **Auditable Case Management**: Provide an immutable, append-only forensic audit log tracking analyst decisions, risk status changes, and investigatory notes.

---

## 3. Key Features & Capabilities

| Module | Description |
|---|---|
| **Executive Command Center** | Real-time surveillance KPI telemetry, volume analytics, alert backlogs, and dynamic risk band distributions (Low, Medium, High, Critical). |
| **Transaction Surveillance** | High-throughput transaction explorer with advanced filtering by risk level, payment format, amount threshold, and temporal range. |
| **Entity Intelligence (KYC)** | Comprehensive account profiles detailing risk histories, counterparties, balance trajectories, and behavioral anomaly tags. |
| **Interactive Graph Topology** | ReactFlow-driven transaction graph rendering directed multi-hop relationships, hub-and-spoke structuring, and flow volumes. |
| **Behavioral Drift Radar** | Per-account behavioral drift monitoring comparing transaction velocities and amounts against warm-up baselines using Page-Hinkley and CUSUM. |
| **Explainable AI (SHAP & DiCE)** | Interactive waterfall and bar charts revealing the exact mathematical impact of each feature on the model's suspicion probability. |
| **Forensic Case Management** | Full analyst investigation workflows: tag alerts, file SARs (Suspicious Activity Reports), dismiss benign anomalies, and record review notes. |
| **Immutable Audit Logging** | Tamper-evident ledger capturing timestamped analyst actions, entity modifications, and authentication events. |
| **Streaming Ingestion Engine** | Vectorized CSV ingestion supporting instant multi-column normalization, automated entity resolution, and asynchronous background processing. |

---

## 4. Technology Stack

### Backend & Machine Learning
- **Framework**: FastAPI (Python 3.11+)
- **ORM & Database**: SQLAlchemy 2.0, PostgreSQL (Postgres 15+, Neon, Render, Supabase, AWS RDS)
- **Driver**: Psycopg2-binary (optimized with `psycopg2.extras.execute_values` bulk operations)
- **Machine Learning**: Scikit-Learn (Random Forest, Gradient Boosting), XGBoost
- **Explainability**: SHAP (SHapley Additive exPlanations), DiCE (Diverse Counterfactual Explanations)
- **Graph Analytics**: NetworkX (PageRank computation, directed node degree metrics)
- **Security & Tokens**: PBKDF2 with SHA-256 (100,000 iterations), custom HMAC-SHA256 URL-safe session tokens

### Frontend & Visual Interface
- **Framework**: Next.js 14 / 15 (React 18+, App Router)
- **Language**: TypeScript 5.0+
- **Styling**: Tailwind CSS with custom Liquid-Glass and Dark/Light Glassmorphism design system
- **UI Components**: Radix UI Primitives, Lucide React icons, Tailwind CSS Animate
- **Data Visualization**: Recharts, Lucide Icons, Custom SVG Gauges & Charts
- **Interactive Graphs**: ReactFlow / Custom SVG Topology Engine

### DevOps & Deployment
- **Containers**: Docker, Docker Compose (multi-stage Node & Python containers)
- **Cloud Compatibility**: Render (`render.yaml`), Vercel (`vercel.json`), AWS, Railway, DigitalOcean

---

## 5. System Architecture

```mermaid
flowchart TD
    subgraph ClientLayer ["Analyst Interface (Next.js 14)"]
        UI["Liquid-Glass Dashboard"]
        GraphUI["Topology Graph (ReactFlow)"]
        ShapUI["SHAP / DiCE Viewer"]
        UploadUI["CSV Ingestion Portal"]
    end

    subgraph APILayer ["FastAPI Application Gateway"]
        Auth["PBKDF2 / HMAC Auth Guard"]
        Router["REST Endpoints (/api/*)"]
        AsyncJobs["Background Ingestion Worker"]
    end

    subgraph AnalyticsEngine ["AegisAML Core Engine"]
        Features["Vectorized Feature Pipeline\n(Group A, B, C)"]
        Drift["Drift Detectors\n(Page-Hinkley, CUSUM, Z-Score)"]
        ML["XGBoost + RF Ensemble"]
        SHAP["SHAP TreeExplainer"]
        Graph["NetworkX PageRank & Degree"]
    end

    subgraph PersistenceLayer ["PostgreSQL 15+"]
        DB_Users[("users")]
        DB_Accounts[("accounts")]
        DB_Transactions[("transactions")]
        DB_Alerts[("alerts")]
        DB_Predictions[("ml_predictions")]
        DB_Expl[("explanations")]
        DB_Audit[("audit_events")]
    end

    UI -->|"Bearer Auth / JSON"| Auth
    UploadUI -->|"Multipart CSV"| Router
    Router --> AsyncJobs
    AsyncJobs --> Features
    Features --> Drift
    Features --> Graph
    Drift --> ML
    Graph --> ML
    ML --> SHAP
    SHAP --> DB_Predictions
    AsyncJobs --> DB_Transactions
    AsyncJobs --> DB_Alerts
    Router --> DB_Accounts
    Router --> DB_Audit
```

---

## 6. Machine Learning & Explainable AI

The detection pipeline evaluates each transaction through four specialized feature tiers:

1. **Group A (Basic Transaction Features)**:
   - `log_amount`: Log-transformed transaction amount ($\ln(1 + \text{amount})$).
   - `is_large_txn`: Binary indicator for transactions exceeding regulatory thresholds (\$10,000+).
   - `payment_format_enc`: Categorical encoding of transfer rails.
   - `day_index` / `timestamp`: Temporal sequence indicators.

2. **Group B (Behavioral Dynamics)**:
   - Rolling 20-window sender/receiver mean and standard deviation.
   - Historical expanding max-to-mean ratio (`acct_max_mean_ratio_send`) detecting sudden liquidity spikes.
   - Cumulative transaction counts avoiding future data leakage.

3. **Group C (Network Graph Topology)**:
   - In-degree, out-degree, and total degree per node.
   - Directed PageRank scores identifying central money-laundering aggregation hubs.

4. **Composite Risk Formulation**:
   $$\text{Composite Score} = 0.70 \times \text{ML Score} + 0.30 \times \text{Drift Score}$$

   - **CRITICAL**: Composite Score $\ge 0.75$
   - **HIGH**: $0.50 \le \text{Composite Score} < 0.75$
   - **MEDIUM**: $0.25 \le \text{Composite Score} < 0.50$
   - **LOW**: $\text{Composite Score} < 0.25$

5. **SHAP Local Feature Explanations**:
   Using `shap.TreeExplainer`, each high-risk score is broken down into constituent feature contributions, answering the regulatory mandate: *"Why did the AI flag this customer?"*

---

## 7. Behavioral Drift Detection Engine

AegisAML incorporates online sequential drift detection algorithms to track entity behavior over time:

- **Page-Hinkley Test**: Tracks cumulative deviation from the running mean. Triggers when the cumulative difference exceeds a tuned sensitivity threshold ($\lambda = 35$).
- **CUSUM (Cumulative Sum Control Chart)**: Two-sided drift tracker utilizing a warmup phase ($n=10$) to calculate baseline mean and variance, detecting positive and negative standardized shifts ($h=4, k=0.5$).
- **Rolling Z-Score Anomaly Detector**: Moving standard deviation window ($w=30$) identifying local outlier spikes ($\ge 2.5\sigma$).

---

## 8. Repository Folder Structure

```
AegisAML/
├── backend/                        # FastAPI Backend Application
│   ├── auth.py                     # PBKDF2 hashing, JWT/HMAC token engine
│   ├── database.py                 # SQLAlchemy engine, connection pooling
│   ├── Dockerfile                  # Production container definition for backend
│   ├── ingest_data.py              # High-throughput batch ingestion script
│   ├── main.py                     # API router, CORS middleware, endpoints
│   ├── models.py                   # SQLAlchemy ORM declarative models
│   ├── pipeline_runner.py          # Vectorized feature engine, drift & SHAP
│   ├── Procfile                    # Render / Heroku process declaration
│   ├── requirements.txt            # Python dependencies for backend
│   ├── schemas.py                  # Pydantic v2 validation models
│   ├── schemas_ext.py              # Extended response schemas
│   ├── .env.example                # Backend environment template
│   └── .gitignore                  # Backend-specific ignore rules
│
├── frontend/                       # Next.js 14 App Router Application
│   ├── public/                     # Static assets, icons, SVGs
│   ├── src/
│   │   ├── app/                    # Next.js App Router routes
│   │   │   ├── (dashboard)/        # Authenticated workspace routes
│   │   │   │   ├── accounts/       # Account intelligence pages
│   │   │   │   ├── alerts/         # Alert triage & review
│   │   │   │   ├── audit-log/      # Append-only immutable audit log
│   │   │   │   ├── dashboard/      # Primary executive KPI command center
│   │   │   │   ├── drift/          # Behavioral drift detection charts
│   │   │   │   ├── explainability/ # SHAP waterfall & feature drivers
│   │   │   │   ├── investigations/ # Case management & analyst notes
│   │   │   │   ├── network/        # Interactive ReactFlow graph
│   │   │   │   ├── reports/        # SAR compliance reporting
│   │   │   │   ├── settings/       # User & system preferences
│   │   │   │   ├── transactions/   # Transaction inspection grid
│   │   │   │   ├── upload/         # Async CSV ingestion & pipeline runner
│   │   │   │   └── watchlist/      # High-risk PEP & sanctioned entities
│   │   │   ├── login/              # Authentication login screen
│   │   │   ├── signup/             # Compliance officer registration
│   │   │   ├── layout.tsx          # Root HTML layout & fonts
│   │   │   ├── page.tsx            # Marketing & platform overview landing
│   │   │   └── globals.css         # Tailwind & Liquid-Glass CSS design system
│   │   ├── components/             # Reusable UI & forensic widgets
│   │   │   ├── layout/             # Sidebar, Topbar, AppShell
│   │   │   ├── ui/                 # Buttons, Cards, Badges, Modals, Tables
│   │   │   ├── DriftChart.tsx      # SVG behavioral drift trend visualizer
│   │   │   └── NetworkGraph.tsx    # Node-link transaction network visualizer
│   │   └── lib/                    # Client libraries (auth, config, utils)
│   ├── Dockerfile                  # Multi-stage production container build
│   ├── package.json                # Frontend dependencies & scripts
│   ├── tsconfig.json               # TypeScript compiler configuration
│   ├── vercel.json                 # Vercel deployment routing manifest
│   ├── .env.example                # Frontend environment template
│   └── .gitignore                  # Frontend-specific ignore rules
│
├── data/                           # Datasets & Reference Artifacts
│   ├── accounts.csv                # 10,000 account synthetic banking registry
│   ├── alerts.csv                  # Reference alert compliance records
│   ├── sample_transactions.csv     # 100-row sample transactions for instant onboarding
│   ├── sample_explanation.json     # Sample SHAP feature attribution output
│   └── README.md                   # Dataset schema documentation & guide
│
├── .env.example                    # Unified root environment configuration
├── .gitignore                      # Root version control ignore rules
├── docker-compose.yml              # Multi-container orchestration (Postgres, API, UI)
├── preprocess.py                   # Offline feature extraction pipeline
├── train.py                        # Model training, drift, and SHAP pipeline
├── test_all_routes.py              # Automated HTTP and UI endpoint smoke test
├── test_pipeline_e2e.py            # End-to-end multi-user ingestion test suite
├── render.yaml                     # Render.com Blueprint deployment configuration
├── requirements.txt                # Root Python dependencies
└── README.md                       # Comprehensive platform documentation
```

---

## 9. Prerequisites & Installation

### System Requirements
- **Node.js**: v18.17.0+ or v20.x LTS
- **Python**: v3.11 or v3.12
- **PostgreSQL**: v14, v15, or v16 (or managed PostgreSQL like Neon, Supabase, AWS RDS)
- **Git**: v2.30+
- **Docker & Docker Compose** *(Optional, for containerized execution)*

### Step 1: Clone Repository
```bash
git clone https://github.com/JaydenD10/AegisAML.git
cd AegisAML
```

### Step 2: Install Python Dependencies
```bash
# Recommended: Create a virtual environment
python -m venv venv

# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate

# Install requirements
pip install -r requirements.txt
```

### Step 3: Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

---

## 10. Environment Variable Configuration

Create your environment files from the provided templates:

### 1. Root / Backend Environment (`backend/.env`)
```bash
cp backend/.env.example backend/.env
```
Populate `backend/.env` with your database credentials:
```ini
# PostgreSQL Database Connection URL
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/aegis_aml

# Authentication Security Secret (At least 32 characters)
AEGIS_SECRET_KEY=super_secure_random_key_production_32_chars_min

# Frontend URL & CORS
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### 2. Frontend Environment (`frontend/.env.local`)
```bash
cp frontend/.env.example frontend/.env.local
```
Configure `frontend/.env.local`:
```ini
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 11. Running AegisAML Locally

### 1. Initialize PostgreSQL Database
Ensure PostgreSQL is active. Create the database:
```sql
CREATE DATABASE aegis_aml;
```
*(The backend automatically creates all tables and indexes on first startup via SQLAlchemy).*

### 2. Start the Backend API
In your Python environment terminal:
```bash
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
The FastAPI backend will start at: `http://127.0.0.1:8000`  
Interactive Swagger documentation: `http://127.0.0.1:8000/docs`

### 3. Start the Next.js Frontend
In a second terminal:
```bash
cd frontend
npm run dev
```
Open your browser to: `http://localhost:3000`

### 4. Default Demo Credentials
The backend pre-seeds a demonstration compliance account on startup:
- **Email**: `analyst@aegisaml.corp`
- **Password**: `password123`
- *Or register a fresh isolated analyst account via `/signup`.*

---

## 12. Running with Docker & Docker Compose

To spin up the entire AegisAML stack (PostgreSQL 15, FastAPI, and Next.js) in isolated containers:

```bash
docker-compose up --build
```

Services will be exposed on:
- **Frontend Dashboard**: `http://localhost:3000`
- **Backend REST API**: `http://localhost:8000`
- **PostgreSQL Database**: `localhost:5432`

To shut down:
```bash
docker-compose down -v
```

---

## 13. Database Schema & Migrations

AegisAML models relational financial entities via SQLAlchemy Declarative ORM:

```
+--------------------+        +---------------------+        +--------------------+
|       users        |        |      accounts       |        |    transactions    |
+--------------------+        +---------------------+        +--------------------+
| id (PK)            |        | account_id (PK)     |        | tx_id (PK)         |
| name               |        | customer_id         |<-------| sender_account_id  |
| email (Unique)     |        | init_balance        |<-------| receiver_account_id|
| password_hash      |        | country             |        | tx_type            |
| role               |        | account_type        |        | tx_amount          |
| created_at         |        | is_fraud            |        | timestamp          |
+--------------------+        | user_id (FK)        |        | is_fraud           |
                              +---------------------+        | alert_id           |
                                         |                   | user_id (FK)       |
                                         |                   +--------------------+
                                         |                             |
                                         v                             v
                              +---------------------+        +--------------------+
                              |       alerts        |        |   ml_predictions   |
                              +---------------------+        +--------------------+
                              | id (PK)             |        | tx_id (PK, FK)     |
                              | alert_type          |        | drift_score        |
                              | tx_id (FK)          |        | ml_score           |
                              | tx_amount           |        | composite_score    |
                              | user_id (FK)        |        | risk_band          |
                              +---------------------+        +--------------------+
```

---

## 14. API Documentation & Endpoints

AegisAML features a complete OpenAPI 3.0 specification available interactively at `/docs` or `/redoc`.

### Key REST Endpoints:
- `GET /api/health`: Health status & database ping.
- `POST /api/auth/signup`: Create a compliance officer account.
- `POST /api/auth/login`: Authenticate and receive an access token.
- `GET /api/auth/me`: Retrieve current analyst identity.
- `GET /api/dashboard/stats`: Aggregated risk indicators, volume, and alert backlog.
- `GET /api/transactions`: Paginated transaction list with risk filtering.
- `GET /api/accounts`: Paginated accounts with risk profiles.
- `GET /api/alerts`: Active compliance alerts.
- `GET /api/network/{accountId}`: Directed 2-hop transaction network neighborhood.
- `GET /api/drift/{accountId}`: Sequential drift detection timeline for an account.
- `GET /api/explainability/{transactionId}`: SHAP TreeExplainer feature attribution values.
- `POST /api/upload/pipeline`: Vectorized CSV ingestion with real-time status reporting.
- `GET /api/upload/status/{jobId}`: Background ingestion progress polling.
- `GET /api/audit`: Append-only audit events log.
- `POST /api/investigations`: Create or update an analyst case review.

---

## 15. Visual Interface & Screenshots

The user interface features a responsive Liquid-Glass design system built for high-density forensic analysis:

| Interface View | Feature Highlights |
|---|---|
| **Executive Dashboard** | Real-time surveillance KPIs, transaction distribution charts, risk band allocation, and recent critical alerts. |
| **Topology Network Graph** | Multi-hop interactive directed node graph showing entity fund flows and intermediary layering hops. |
| **SHAP Explainability** | Risk-increasing vs. risk-decreasing waterfall charts providing full model transparency. |
| **Behavioral Drift Radar** | Temporal Page-Hinkley and CUSUM deviation lines displaying structural behavior anomalies. |
| **Data Ingestion Portal** | Drag-and-drop CSV upload with live progress bar and automated schema matching. |

*(Placeholders: Add application screenshots to `/docs/screenshots/` to display previews in documentation).*

---

## 16. Security & Compliance Safeguards

- **Multi-Tenant User Isolation**: Every uploaded transaction, account, alert, and investigation note is strictly filtered by the authenticated user's ID, preventing data leakage across analysts.
- **Secure Password Hashing**: PBKDF2 with SHA-256 and 100,000 iterations using cryptographic random salt.
- **Zero Secrets in Repository**: `.gitignore` strictly excludes all `.env` files, production credentials, and large binaries.
- **Immutable Audit Trail**: All alert dismissals, case escalations, and report exports are logged to `audit_events` with non-modifiable timestamps.

---

## 17. Roadmap & Future Improvements

- [ ] **GNN Layering Models**: Integrate Graph Neural Networks (Graph Convolutional Networks / GraphSAGE) directly into the feature pipeline for structural anomaly scoring.
- [ ] **Automated SAR XML Generation**: Export FinCEN-compliant Suspicious Activity Report (SAR) XML documents directly from the investigation page.
- [ ] **Real-time Kafka / WebSocket Ingestion**: Stream high-frequency transactional data via Apache Kafka brokers directly into memory-backed sliding windows.
- [ ] **Client-Side WASM Graph Engine**: Move large-scale multi-thousand-node graph rendering to WebAssembly / WebGL for sub-millisecond layout calculations.

---

Developed with precision for financial crime prevention and compliance integrity.
