import os
import time
import uuid
import warnings
warnings.filterwarnings("ignore")

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from pydantic import BaseModel
from typing import Optional

# Import the pipeline from our classifier code
from tagsense_classifier import TagSensePipeline

app = FastAPI(title="TagSense AI - Enterprise Content Platform", version="1.0.0")

# Initialize and train the ML pipeline on startup
pipeline = TagSensePipeline()
pipeline.train()

# Request model for classification endpoint
class TextRequest(BaseModel):
    text: str
    content_id: Optional[str] = None

@app.post("/api/classify")
async def classify_content(request: TextRequest):
    if not request.text or len(request.text.strip()) == 0:
        raise HTTPException(status_code=400, detail="Text payload cannot be empty.")
    
    try:
        start_time = time.time()
        result = pipeline.process(request.text, request.content_id)
        latency = int((time.time() - start_time) * 1000)
        
        result["processing_time_ms"] = max(latency, 1)
        
        # SQL insertion logs
        content_id = result["content_id"]
        category = result["category"]
        confidence = result["confidence"]
        language = result["language"]
        is_safe = result["moderation"]["is_safe"]
        severity = result["moderation"]["severity"]
        action = result["moderation"]["action"]
        tags = result["tags"]
        
        simulated_sql = [
            f"INSERT INTO content_metadata (content_id, uploader_id, content_type, file_url, file_size_bytes, language_detected, processing_status) VALUES ('{content_id}', '{uuid.uuid4()}', 'TEXT', 's3://tagsense-uploads/{content_id}.txt', {len(request.text)}, '{language}', 'COMPLETED');",
            f"INSERT INTO classification_labels (content_id, category, confidence_score, model_version, is_human_verified) VALUES ('{content_id}', '{category}', {confidence:.3f}, 'v1.0.0', FALSE);",
            f"INSERT INTO moderation_results (content_id, is_flagged, flag_reason, severity_level, action_taken, auto_moderated) VALUES ('{content_id}', {not is_safe}, '{'Flagged content matched' if not is_safe else 'None'}', '{severity}', '{action}', TRUE);"
        ]
        for t in tags:
            simulated_sql.append(
                f"INSERT INTO tags (content_id, tag_name, tag_type, relevance_score) VALUES ('{content_id}', '{t['name']}', '{t['type']}', {t['score']:.3f});"
            )
            
        result["sql_statements"] = simulated_sql
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline error: {str(e)}")

# Mount static folder for frontend resources
static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
os.makedirs(static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Root endpoints & Direct page serving
@app.get("/")
@app.get("/dashboard")
async def read_dashboard():
    return FileResponse(os.path.join(static_dir, "index.html"))

@app.get("/login")
async def read_login():
    return FileResponse(os.path.join(static_dir, "login.html"))

@app.get("/admin")
async def read_admin():
    return FileResponse(os.path.join(static_dir, "admin.html"))

@app.get("/upload")
async def read_upload():
    return FileResponse(os.path.join(static_dir, "upload.html"))

@app.get("/classification")
async def read_classification():
    return FileResponse(os.path.join(static_dir, "classification.html"))

@app.get("/moderation")
async def read_moderation():
    return FileResponse(os.path.join(static_dir, "moderation.html"))

@app.get("/analytics")
async def read_analytics():
    return FileResponse(os.path.join(static_dir, "analytics.html"))



# Static assets shortcuts to support ROOT links in HTML files
@app.get("/style.css")
async def read_css():
    return FileResponse(os.path.join(static_dir, "style.css"))

@app.get("/app.js")
async def read_js():
    return FileResponse(os.path.join(static_dir, "app.js"))
