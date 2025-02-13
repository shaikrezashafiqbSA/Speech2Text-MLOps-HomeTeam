import logging
from fastapi import FastAPI, File, UploadFile
import tempfile
import librosa
from models.wav2vec2_model import Wav2Vec2Model
import os

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
        speech, sr = librosa.load(audio_path, sr=16000)
        duration = len(speech) / sr
    finally:
        os.unlink(audio_path)
    
    return {
        "transcription": transcription,
        "duration": f"{duration:.1f}"
        }
    