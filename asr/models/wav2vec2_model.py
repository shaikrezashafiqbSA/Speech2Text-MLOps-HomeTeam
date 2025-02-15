import torch
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
import numpy as np
from .base_asr_model import BaseASRModel


class Wav2Vec2Model(BaseASRModel):
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        # print(f"GPU availability: {self.device}")
        self.processor = Wav2Vec2Processor.from_pretrained("facebook/wav2vec2-large-960h")
        self.model = Wav2Vec2ForCTC.from_pretrained("facebook/wav2vec2-large-960h")#.to(self.device)

    def transcribe(self, audio_array: np.ndarray) -> str:
        inputs = self.processor(audio_array, 
                                return_tensors="pt", 
                                sampling_rate=16000
                                )
        logits = self.model(inputs.input_values).logits
        predicted_ids = torch.argmax(logits, dim=-1)
        transcription = self.processor.batch_decode(predicted_ids)[0]
        return transcription

