import sys
import os
import time 
import numpy as np
# add asr/models package to path so that can import models
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import logging
from fastapi import FastAPI, File, UploadFile
import tempfile
import librosa
from models.wav2vec2_model import Wav2Vec2Model
from contextlib import asynccontextmanager

# set logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)



# initialise the ASR model (we can change this to load different models!) - perhaps via set env
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("ASR_API App startup: Loading ASR model")
    app.asr_model = None
    t0 = time.time()
    app.asr_model = Wav2Vec2Model()
    dur_model_load = np.round(time.time() - t0,2)
    logger.info(f"ASR model loaded in {dur_model_load}s")
    yield

# initialise fastAPI app
app = FastAPI(lifespan=lifespan)


# 1) GET healthcheck endpoint 
@app.get("/ping")
async def ping():
    logger.info("healthcheck endpoint was called")

    if not app.asr_model:
        return {"message": "Model is still loading. Please wait ~2 minutes and try again."}
    return {"message": "pong"}

# 2)a) POST transcription endpoint - SLOWER: high disk read/write but low memory usage
@app.post("/asr")
async def transcribe(file: UploadFile = File(...)):
    logger.info("asr endpoint was called")

    if not app.asr_model:
        return {"error": "Model is still loading. Please wait ~2 minutes and try again."}
    
    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        tmp.write(await file.read())
        audio_path = tmp.name

    try:

        t1 = time.time()
        # load, resample audio file to 16kHz
        speech, sr = librosa.load(audio_path, sr=16000)
        resample_time = np.round(time.time() - t1, 2)
        duration = len(speech) / sr

        # Transcribe audio file using asr_model
        transcription = app.asr_model.transcribe(speech)

    except Exception as e:
        logger.error(f"Error processing file: {str(e)}")
        # Collect unprocessed files data into list to be investigated later
    
    
    finally:
        # Ensure the temporary file is deleted after processing
        os.unlink(audio_path)
    
    # Return the transcription, duration, and resample time as a JSON response
    return {
        "transcription": transcription,
        "duration": f"{duration:.1f}",
        "resample_time":f"{resample_time:.1f}"
        }

    