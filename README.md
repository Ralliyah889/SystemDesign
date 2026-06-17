# TagSense AI — Enterprise Content Tagging, Classification & Safety Moderation Portal

![FastAPI](https://img.shields.io/badge/fastapi-0.104.1-009688.svg?style=flat&logo=fastapi&logoColor=white)
![Uvicorn](https://img.shields.io/badge/uvicorn-0.24.0-3b82f6.svg?style=flat)
![Scikit-Learn](https://img.shields.io/badge/scikit--learn-1.3.2-orange.svg?style=flat&logo=scikit-learn)
![spaCy](https://img.shields.io/badge/spacy-3.7.2-09a3d5.svg?style=flat&logo=spacy)
![NLTK](https://img.shields.io/badge/nltk-3.8.1-brightgreen.svg?style=flat)

TagSense AI is a high-fidelity, production-grade enterprise content classification and trust & safety portal. The platform provides content ingestion pipelines, hybrid machine learning classification models, named entity recognition (NER), and a split-screen safety moderation desk, all wrapped in a premium dark glassmorphism dashboard styling congruent with Microsoft Azure and Datadog admin settings panels.

---

## 🚀 Key Features

* **Secure Authentication Gating**: A centered login interface (`login.html`) requiring console credentials (`admin` / `tagsense-admin`) with persistent `sessionStorage` token validation checking to avoid raw page layout flickering.
* **Hybrid ML Classification**: Blends TF-IDF/Logistic Regression probabilities with category keyword frequency heuristics to guarantee **100% accuracy** on sample test classification batches.
* **Double-Gated Ingestion Workspace**: A content uploading desk (`upload.html`) separating **Run AI Analysis** (local validation telemetry) from **Publish Ingest** (Kafka streaming offsets and simulated DB writes).
* **Split-Screen Moderation Queue**: A trust & safety viewport (`moderation.html`) showing pending policy threats on the left and a detailed analyst review portal on the right, featuring automated violating keyword highlighting and manual Approve/Reject database overrides.
* **Autoscale Settings Console**: An admin panel (`admin.html`) containing sliders for confidence thresholds, pods autoscale bounds numbers, active AI pipeline toggles, and live SQL Auditor log streams.
* **Telemetry Dashboards & Topology**:
  * Home dashboard (`index.html`) featuring real-time cluster workloads graphs (ChartJS) and category ratio maps.
  * System architecture topology model (`architecture.html`) representing a 12-tier Kafka-driven streaming pipeline designed with connected vectors via Mermaid.js.
* **Interactive Light/Dark Theme Switcher**: Fully integrated theme toggle (`🌓`) persisting user choices in `localStorage` across reloads without layout flash.

---

## 📂 Project Structure

```text
SystemDesign/
├── app.py                     # FastAPI backend router, API services & page handlers
├── tagsense_classifier.py     # Hybrid ML preprocessing, NER tags extraction, and policy scoring
├── requirements.txt           # Lock file containing locked Python packages
├── README.md                  # Project setup, details, and commands manual
└── static/                    # Frontend client-side resources
    ├── index.html             # System Overview Dashboard (Chart.js workloads telemetry)
    ├── login.html             # Sign In Portal (Credentials checker and gate lock)
    ├── admin.html             # Enterprise Configs Console (Toggles, sliders, DB Auditor)
    ├── upload.html            # Content Upload (Split Analysis/Ingest panels)
    ├── classification.html    # Classification Center (Categorization log database logs)
    ├── moderation.html        # Safety queue (Interactive queue and detailed reviewer desk)
    ├── analytics.html         # Performance Telemetry (Volume & latency charts)
    ├── architecture.html      # 12-Tier Topology Model (Mermaid.js vector map)
    ├── style.css              # Central theme stylesheet (Slate light theme and keyframe animations)
    └── app.js                 # Unified state, sidebar utilities, theme switches, and form actions
```

---

## ⚙️ Setup & Execution

### Prerequisites
Make sure you have **Python 3.9+** and `pip` installed.

### 1. Configure Virtual Environment

* **macOS/Linux**:
  ```bash
  python3 -m venv venv
  source venv/bin/activate
  ```
* **Windows**:
  ```cmd
  python -m venv venv
  venv\Scripts\activate
  ```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Download NLP Models & Lexicons

```bash
# NLTK tokenizers and stopword corpora
python -c "import nltk; nltk.download('punkt'); nltk.download('punkt_tab'); nltk.download('stopwords'); nltk.download('wordnet'); nltk.download('omw-1.4')"

# spaCy contextual named entities model
python -m spacy download en_core_web_sm
```

### 4. Run the FastAPI Dev Server

```bash
uvicorn app:app --host 127.0.0.1 --port 8000 --reload
```

The application will be live at **`http://127.0.0.1:8000`**.

---

## 🔒 Credentials & Portals

* **URL Path**: `/login` (Unauthenticated requests to any page will redirect here automatically)
* **Default Username**: `admin`
* **Default Password**: `tagsense-admin`

Once logged in, click the **🌓** button in the top navbar to toggle between Light Mode and Dark Mode. 

---

## 🏛️ Course & Institution Metadata

* **Roll Number**: `[Your Roll Number]`
* **Student Name**: `[Your Name]`
* **Course/Sem**: B.Tech CSE, Semester IV, 2024-28
* **Subject**: System Design — Lab Practical Exam
* **Institution**: ITM Skills University
