import torch
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
import librosa

from .base_asr_model import BaseASRModel

class Wav2Vec2Model(BaseASRModel):
    def __init__(self):
        self.processor = Wav2Vec2Processor.from_pretrained("facebook/wav2vec2-large-960h")
        self.model = Wav2Vec2ForCTC.from_pretrained("facebook/wav2vec2-large-960h")

    def transcribe(self, audio_path: str) -> str:
        speech, sr = librosa.load(audio_path, sr=16000)
        inputs = self.processor(speech, return_tensors="pt", sampling_rate=16000)
        logits = self.model(inputs.input_values).logits
        predicted_ids = torch.argmax(logits, dim=-1)
        transcription = self.processor.batch_decode(predicted_ids)[0]
        return transcription

