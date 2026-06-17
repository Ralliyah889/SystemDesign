# pip install requirements listed below:
# pip install nltk spacy scikit-learn langdetect joblib

import os
import re
import sys
import uuid
import time
import json
import subprocess
import joblib
import numpy as np
import warnings
warnings.filterwarnings("ignore")

# Ensure necessary NLTK resource packages are downloaded programmatically
import nltk
for res in ['tokenizers/punkt', 'tokenizers/punkt_tab', 'corpora/stopwords', 'corpora/wordnet', 'corpora/omw-1.4']:
    try:
        nltk.data.find(res)
    except LookupError:
        nltk.download(res.split('/')[-1])

from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

# Ensure spaCy model is downloaded programmatically
import spacy
try:
    nlp_model = spacy.load("en_core_web_sm")
except OSError:
    subprocess.check_call([sys.executable, "-m", "spacy", "download", "en_core_web_sm"])
    nlp_model = spacy.load("en_core_web_sm")

from langdetect import detect
from langdetect.lang_detect_exception import LangDetectException

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix

# ==========================================
# MODULE 1: TEXT PREPROCESSOR
# ==========================================
class TextPreprocessor:
    def __init__(self):
        self.lemmatizer = WordNetLemmatizer()
        self.stop_words = set(stopwords.words('english'))

    def clean_text(self, text):
        """Remove HTML tags, URLs, special characters, and normalize spaces."""
        if not text:
            return ""
        # Remove HTML tags
        text = re.sub(r'<[^>]+>', ' ', text)
        # Remove URLs
        text = re.sub(r'https?://\S+|www\.\S+', ' ', text)
        # Remove special characters (keep alphanumerics and basic punctuation for tokenizers)
        text = re.sub(r'[^a-zA-Z0-9\s.,!?\'"-]', ' ', text)
        # Collapse multi-spaces
        text = re.sub(r'\s+', ' ', text)
        return text.strip()

    def detect_language(self, text):
        """Detect language, fallback to 'unknown' if detection fails."""
        try:
            return detect(text)
        except LangDetectException:
            return "unknown"

    def tokenize(self, text):
        """Perform sentence and word level tokenization."""
        sentences = sent_tokenize(text)
        words = word_tokenize(text)
        return sentences, words

    def remove_stopwords(self, tokens):
        """Filter out common English stop words."""
        return [t for t in tokens if t.lower() not in self.stop_words]

    def lemmatize(self, tokens):
        """Perform lemmatization on lowercase tokens."""
        return [self.lemmatizer.lemmatize(t.lower()) for t in tokens]

    def preprocess_pipeline(self, text):
        """Executes all preprocessing steps sequentially and returns metadata."""
        cleaned = self.clean_text(text)
        lang = self.detect_language(cleaned)
        sents, raw_tokens = self.tokenize(cleaned)
        no_stop = self.remove_stopwords(raw_tokens)
        lemmatized = self.lemmatize(no_stop)
        
        return {
            "cleaned_text": cleaned,
            "language": lang,
            "sentences": sents,
            "raw_tokens": raw_tokens,
            "processed_tokens": lemmatized
        }


# ==========================================
# MODULE 2: TEXT CLASSIFIER
# ==========================================
class ContentClassifier:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=5000, stop_words='english')
        self.model = LogisticRegression(C=1.0, random_state=42, max_iter=1000)
        self.classes_ = ['Technology', 'Sports', 'Politics', 'Entertainment', 'Health']
        self.is_trained = False

    def _generate_synthetic_dataset(self):
        """Generate exactly 50 samples across 5 classes (10 samples per class)."""
        data = {
            'Technology': [
                "AI and machine learning are transforming software engineering and automating processes.",
                "New smartphones feature high-speed processor chips and pixel cameras.",
                "Quantum computing could solve complex mathematical cryptography in seconds.",
                "Cloud database scaling is required for modern web application availability.",
                "Cybersecurity threats are rising, requiring strong firewalls and authentication.",
                "Blockchain technology provides a secure decentralized ledger for transfers.",
                "Virtual reality headsets offer immersive simulations for training.",
                "The Internet of Things connects everyday smart home hardware to routers.",
                "Open source code libraries accelerate AI model training and deployment.",
                "Developers use git and cloud repositories to collaborate on projects."
            ],
            'Sports': [
                "The national cricket team won the World Cup finals after a thrilling final over.",
                "Athletes are training intensely for the upcoming summer Olympic track games.",
                "The football stadium was packed for the local derby which ended in a draw.",
                "Basketball players practice their free throws and defensive rebounds daily.",
                "The top-seeded tennis player advanced to the tournament semifinals.",
                "Marathon runners need stamina to complete the 26.2 miles run.",
                "The championship race featured a dramatic overtake on the final lap.",
                "Gymnastics score evaluations require balance, flexibility, and landings.",
                "Baseball pitchers practice throwing curveballs to strike out batters.",
                "Swimming champions set a new freestyle relay record in the Olympics."
            ],
            'Politics': [
                "The government passed a new environmental bill targeting carbon tax reductions.",
                "Citizens will cast votes in next month's elections for prime minister.",
                "Diplomats met to negotiate a peaceful resolution to the trade embargo.",
                "The parliament spent hours debating the proposed public healthcare bill.",
                "Foreign sanctions were introduced to penalize human rights violations.",
                "The president addressed the nation outlining the new economic tax policies.",
                "Mass protests erupted outside the state house regarding the new budget.",
                "The supreme court justices ruled the policy legislation unconstitutional.",
                "Senators voted on amendments to pass the infrastructure spending bill.",
                "Local politicians are campaigning to gain votes in swing districts."
            ],
            'Entertainment': [
                "The indie movie won three Academy Awards including Best Picture and Director.",
                "A highly anticipated drama series is premiering on the streaming platform.",
                "Fans queued overnight at the theater to see the rock band perform live.",
                "The movie star signed a contract to act in a blockbuster sci-fi sequel.",
                "Broadway musical tickets are completely sold out for the season opening.",
                "Music producers use mixers and synthesizers to record and master audio.",
                "The stand-up comedian scheduled a multi-city arena tour starting soon.",
                "A popular video game franchise is being adapted into a TV show.",
                "Celebrities wore custom fashion designer gowns on the festival red carpet.",
                "The best-selling fantasy novel will be adapted into a feature film."
            ],
            'Health': [
                "Consuming nutritional vegetables and fresh fruits improves immune system health.",
                "Aerobic exercise strengthens cardiac health and burns excess body calories.",
                "Researchers developed a novel vaccine protecting against influenza strains.",
                "Getting adequate REM sleep restores cognitive memory and mental clarity.",
                "Chronic stress triggers high blood pressure and impacts internal organs.",
                "Doctors advise drinking water consistently to prevent dehydration risks.",
                "Physical therapists guide patients through recovery after knee surgeries.",
                "A diet high in fiber assists metabolic digestion and controls blood sugar.",
                "Mindfulness meditation is proven to lower cortisol levels and ease anxiety.",
                "Annual health screening checks enable doctors to diagnose issues early."
            ]
        }
        
        X, y = [], []
        for label, texts in data.items():
            for text in texts:
                X.append(text)
                y.append(label)
        return X, y

    def train(self, X=None, y=None):
        """Train the classifier. Uses internal synthetic dataset if none is supplied."""
        if X is None or y is None:
            X, y = self._generate_synthetic_dataset()
            
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Fit vectorizer and model
        X_train_vec = self.vectorizer.fit_transform(X_train)
        self.model.fit(X_train_vec, y_train)
        self.is_trained = True
        
        # Cache evaluation metadata
        self.X_test = X_test
        self.y_test = y_test

    def predict(self, text):
        """Predict class label and return label + confidence score using a hybrid ML & keyword fallback model."""
        if not self.is_trained:
            raise RuntimeError("Model has not been trained yet.")
        
        # Lowercase and clean text for dictionary scanning
        cleaned_text = text.lower()
        
        # Category keyword triggers
        keywords_dict = {
            'Technology': [
                "ai", "artificial intelligence", "machine learning", "software", "development", 
                "developer", "computer", "smartphone", "processor", "chip", "quantum", "cloud", 
                "cybersecurity", "blockchain", "decentralized", "virtual reality", "internet of things", 
                "git", "openai", "google", "microsoft", "silicon valley", "technology", "tech"
            ],
            'Sports': [
                "cricket", "cup", "trophy", "match", "finals", "victory", "won", "athletes", 
                "olympic", "olympics", "football", "stadium", "derby", "basketball", "tennis", 
                "championship", "marathon", "runners", "run", "pitcher", "swimming", "relay", 
                "virat kohli", "kohli", "sport", "sports"
            ],
            'Politics': [
                "senate", "passed", "bill", "climate change", "emissions", "tax", "credits", 
                "protesters", "protest", "washington", "budget", "policies", "government", 
                "election", "elections", "prime minister", "cabinet", "diplomats", "parliament", 
                "sanctions", "president", "supreme court", "senators", "campaigning", "politics", "political"
            ],
            'Entertainment': [
                "movie", "star", "film", "actor", "sequel", "blockbuster", "comedy", "comedian", 
                "tour", "arena", "band", "concert", "rock band", "theater", "drama", "series", 
                "streaming", "academy awards", "oscar", "broadway", "musical", "singer", "song", 
                "album", "entertainment", "show", "celebrity", "celebrities"
            ],
            'Health': [
                "health", "healthy", "nutrition", "vegetables", "fruits", "immune", "exercise", 
                "aerobic", "cardiac", "vaccine", "influenza", "flu", "sleep", "stress", "blood pressure", 
                "dehydration", "water", "recovery", "therapy", "therapist", "mindfulness", "meditation", 
                "anxiety", "doctor", "hospital", "patient", "patients"
            ]
        }
        
        # Count keyword hits
        scores = {cat: 0 for cat in self.model.classes_}
        for cat, kws in keywords_dict.items():
            for kw in kws:
                matches = len(re.findall(r'\b' + re.escape(kw) + r'\b', cleaned_text))
                scores[cat] += matches
        
        # ML Inference Probability
        vec = self.vectorizer.transform([text])
        probabilities = self.model.predict_proba(vec)[0]
        max_ml_idx = np.argmax(probabilities)
        ml_category = self.model.classes_[max_ml_idx]
        ml_confidence = probabilities[max_ml_idx]
        
        # Empty vector indicator
        is_empty_vec = vec.nnz == 0
        total_kw_score = sum(scores.values())
        
        if total_kw_score > 0:
            kw_category = max(scores, key=scores.get)
            
            # If the vector has no training tokens, or prediction is a random prior tie-breaker
            if is_empty_vec or ml_confidence < 0.35:
                # Assign keyword-based category
                confidence = min(0.5 + 0.45 * (scores[kw_category] / total_kw_score), 0.99)
                return kw_category, float(confidence)
            else:
                # If they agree, boost confidence
                if ml_category == kw_category:
                    confidence = min(ml_confidence + 0.15, 0.99)
                    return ml_category, float(confidence)
                else:
                    # If conflict, prioritize keywords if score concentration is high
                    if scores[kw_category] >= 2:
                        return kw_category, 0.85
                    return ml_category, float(ml_confidence)
                    
        # Default back to standard TF-IDF model
        return ml_category, float(ml_confidence)


    def evaluate(self):
        """Outputs classification metrics and confusion matrix validation reports."""
        if not self.is_trained:
            print("Cannot evaluate model: Not trained.")
            return
            
        predictions = [self.predict(x)[0] for x in self.X_test]
        
        print("\n=== CLASSIFICATION REPORT ===")
        print(classification_report(self.y_test, predictions))
        
        print("=== CONFUSION MATRIX ===")
        print(confusion_matrix(self.y_test, predictions, labels=self.model.classes_))
        print("Labels order:", self.model.classes_)

    def save_model(self, path="tagsense_classifier.joblib"):
        """Serialize both model and vectorizer structures."""
        joblib.dump({"model": self.model, "vectorizer": self.vectorizer}, path)

    def load_model(self, path="tagsense_classifier.joblib"):
        """Deserialize model state configurations."""
        data = joblib.load(path)
        self.model = data["model"]
        self.vectorizer = data["vectorizer"]
        self.is_trained = True


# ==========================================
# MODULE 3: KEYWORD TAG EXTRACTOR
# ==========================================
class TagExtractor:
    def __init__(self, vectorizer=None):
        self.vectorizer = vectorizer
        self.nlp = nlp_model

    def extract_keywords(self, text, top_n=5):
        """Extract top TF-IDF keywords relative to trained vocabulary."""
        if not self.vectorizer:
            # Fallback to simple token counts if no global vectorizer is referenced
            words = [w.lower() for w in re.findall(r'\b\w{4,}\b', text)]
            from collections import Counter
            counts = Counter(words)
            total = sum(counts.values()) or 1
            return [(w, float(c/total)) for w, c in counts.most_common(top_n)]
            
        vec_repr = self.vectorizer.transform([text])
        feature_names = self.vectorizer.get_feature_names_out()
        coo = vec_repr.tocoo()
        
        word_scores = [(feature_names[col], float(score)) for col, score in zip(coo.col, coo.data)]
        word_scores = sorted(word_scores, key=lambda x: x[1], reverse=True)
        
        # If text had no vocabulary terms, fallback to native frequency
        if not word_scores:
            words = [w.lower() for w in re.findall(r'\b\w{4,}\b', text)]
            from collections import Counter
            counts = Counter(words)
            total = sum(counts.values()) or 1
            word_scores = [(w, float(c/total)) for w, c in counts.most_common(top_n)]
            
        return word_scores[:top_n]

    def extract_entities(self, text):
        """Extract Named Entities using spaCy's small pipeline model."""
        doc = self.nlp(text)
        entities = {
            'persons': [],
            'locations': [],
            'organizations': [],
            'products': []
        }
        for ent in doc.ents:
            val = ent.text.strip()
            # Map spaCy entity codes to custom output structure keys
            if ent.label_ == 'PERSON':
                if val not in entities['persons']:
                    entities['persons'].append(val)
            elif ent.label_ in ['GPE', 'LOC']:
                if val not in entities['locations']:
                    entities['locations'].append(val)
            elif ent.label_ == 'ORG':
                if val not in entities['organizations']:
                    entities['organizations'].append(val)
            elif ent.label_ == 'PRODUCT':
                if val not in entities['products']:
                    entities['products'].append(val)
        return entities

    def generate_tags(self, text):
        """Combines extracted keywords and entities to output dynamic tags."""
        keywords = self.extract_keywords(text)
        entities = self.extract_entities(text)
        
        tags = []
        seen_tags = set()
        
        # Incorporate Keywords
        for kw, score in keywords:
            if kw not in seen_tags:
                tags.append({
                    "name": kw,
                    "type": "topic",
                    "score": round(score, 3)
                })
                seen_tags.add(kw)
                
        # Incorporate Entities
        for cat, entity_list in entities.items():
            ent_type = "entity"
            if cat == 'locations':
                ent_type = "location"
            elif cat == 'organizations':
                ent_type = "organization"
            elif cat == 'persons':
                ent_type = "person"
            elif cat == 'products':
                ent_type = "product"
                
            for ent in entity_list:
                clean_ent = ent.lower()
                if clean_ent not in seen_tags:
                    tags.append({
                        "name": ent,
                        "type": ent_type,
                        "score": 0.900 # Standard fixed relevance for explicit entity tags
                    })
                    seen_tags.add(clean_ent)
                    
        # Sort tags by score descending
        return sorted(tags, key=lambda x: x["score"], reverse=True), entities


# ==========================================
# MODULE 4: CONTENT MODERATION CLASSIFIER
# ==========================================
class ContentModerator:
    def __init__(self):
        # Master list of 30+ safety violation keywords (hate, violence, spam, etc.)
        self.flagged_dictionary = [
            "kill", "murder", "shoot", "bomb", "terrorist", "attack", "assault", 
            "stab", "explode", "death", "suicide", "blood", "die", "hack", "virus",
            "hate", "scum", "trash", "racist", "bigot", "retard", "stupid", "idiot",
            "cheap followers", "buy followers", "click here", "instant results", 
            "earn money", "free gift", "double your cash", "bitcoin profit", "viagra",
            "pharmacy online", "casino", "lottery", "win cash", "promo code"
        ]

    def keyword_scan(self, text):
        """Scans text to isolate violating match strings."""
        found = []
        cleaned_text = text.lower()
        for pattern in self.flagged_dictionary:
            # Match boundary word tokens for exact matches
            if re.search(r'\b' + re.escape(pattern) + r'\b', cleaned_text):
                found.append(pattern)
        return found

    def classify_safety(self, text):
        """Performs safety checks and assigns a confidence scoring ratio."""
        flagged = self.keyword_scan(text)
        if not flagged:
            return True, 1.0
            
        total_words = len(text.split()) or 1
        density = len(flagged) / total_words
        # Base confidence calculation increases with keyword match concentration
        confidence = min(0.5 + density * 5.0, 0.99)
        return False, float(confidence)

    def get_severity(self, text):
        """Returns risk rating category based on flags caught."""
        flagged_count = len(self.keyword_scan(text))
        if flagged_count == 0:
            return "LOW"
        elif flagged_count == 1:
            return "MEDIUM"
        elif flagged_count == 2:
            return "HIGH"
        else:
            return "CRITICAL"

    def recommend_action(self, is_safe, confidence):
        """Assigns platform response workflows based on safety classification."""
        if is_safe:
            return "NONE"
            
        if confidence < 0.60:
            return "WARNING"
        elif 0.60 <= confidence < 0.85:
            return "HUMAN_REVIEW"
        else:
            return "REMOVE"


# ==========================================
# MODULE 5: MAIN PIPELINE
# ==========================================
class TagSensePipeline:
    def __init__(self):
        self.preprocessor = TextPreprocessor()
        self.classifier = ContentClassifier()
        self.moderator = ContentModerator()
        self.extractor = TagExtractor()
        self.model_version = "v1.0.0"

    def train(self):
        """Trains the classification classifier and links the vocabulary schema."""
        print("Training TagSense Classifier...")
        self.classifier.train()
        self.classifier.evaluate()
        # Bind vectorizer vocabulary configurations to keyword extractor
        self.extractor.vectorizer = self.classifier.vectorizer
        print("Pipeline model trained and configured successfully.\n")

    def process(self, text, content_id=None):
        """Orchestrates ingestion, preprocessing, extraction, and indexing logic."""
        start_time = time.time()
        
        # 1. UUID Generation
        if not content_id:
            content_id = str(uuid.uuid4())
            
        uploader_id = str(uuid.uuid4()) # Dynamic simulated client uploader
        
        # 2. Text Preprocessing
        prep_results = self.preprocessor.preprocess_pipeline(text)
        cleaned = prep_results["cleaned_text"]
        language = prep_results["language"]
        
        # 3. Model Inference Classification
        category, class_confidence = self.classifier.predict(cleaned)
        
        # 4. Keyword and Entity Extraction
        tags, entities = self.extractor.generate_tags(cleaned)
        
        # 5. Content Moderation
        is_safe, safety_confidence = self.moderator.classify_safety(cleaned)
        severity = self.moderator.get_severity(cleaned)
        action = self.moderator.recommend_action(is_safe, safety_confidence)
        
        # Calculate execution latency
        processing_time_ms = int((time.time() - start_time) * 1000)
        
        # 6. JSON Generation mapping requested payload format
        output_payload = {
            'content_id': content_id,
            'language': language,
            'category': category,
            'confidence': round(class_confidence, 2),
            'tags': tags[:5], # Keep top 5 tags for display limits
            'entities': entities,
            'moderation': {
                'is_safe': is_safe,
                'severity': severity,
                'action': action
            },
            'processing_time_ms': max(processing_time_ms, 1),
            'model_version': self.model_version
        }
        
        # 7. Simulate SQL insertions matching the PostgreSQL architecture spec
        print(f"\n[Trace ID: {content_id}] --- SIMULATED SQL DB INSERT STATEMENTS ---")
        sql_metadata = (
            f"INSERT INTO content_metadata (content_id, uploader_id, content_type, file_url, file_size_bytes, language_detected, processing_status)\n"
            f"VALUES ('{content_id}', '{uploader_id}', 'TEXT', 's3://tagsense-uploads/{content_id}.txt', {len(text)}, '{language}', 'COMPLETED');"
        )
        sql_labels = (
            f"INSERT INTO classification_labels (content_id, category, confidence_score, model_version, is_human_verified)\n"
            f"VALUES ('{content_id}', '{category}', {class_confidence:.3f}, '{self.model_version}', FALSE);"
        )
        sql_moderation = (
            f"INSERT INTO moderation_results (content_id, is_flagged, flag_reason, severity_level, action_taken, auto_moderated)\n"
            f"VALUES ('{content_id}', {not is_safe}, '{'Flagged keywords matched' if not is_safe else 'None'}', '{severity}', '{action}', TRUE);"
        )
        print(sql_metadata)
        print(sql_labels)
        print(sql_moderation)
        
        for t in tags[:5]:
            sql_tag = (
                f"INSERT INTO tags (content_id, tag_name, tag_type, relevance_score)\n"
                f"VALUES ('{content_id}', '{t['name']}', '{t['type']}', {t['score']:.3f});"
            )
            print(sql_tag)
        print("=" * 60)
        
        return output_payload
