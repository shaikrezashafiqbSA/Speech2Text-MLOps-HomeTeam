import sys
import os
import time 
import numpy as np
# Add the directory containing the models package to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import logging
from fastapi import FastAPI, File, UploadFile
import tempfile
import librosa
from models.wav2vec2_model import Wav2Vec2Model

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


app = FastAPI()

# Initialize the ASR model (you can change this to load different models)

asr_model = Wav2Vec2Model()

@app.get("/ping")
async def ping():
    logger.info("Ping endpoint was called")
    return {"message": "pong"}

@app.post("/asr")
async def transcribe(file: UploadFile = File(...)):
    logger.info("asr endpoint was called")
    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        tmp.write(await file.read())
        audio_path = tmp.name

    try:
        transcription = asr_model.transcribe(audio_path)
        t1 = time.time()
        speech, sr = librosa.load(audio_path, sr=16000)
        resample_time = np.round(time.time() - t1, 2)
        duration = len(speech) / sr
    finally:
        os.unlink(audio_path)
    
    return {
        "transcription": transcription,
        "duration": f"{duration:.1f}",
        "resample_time":f"{resample_time:.1f}"
        }
    