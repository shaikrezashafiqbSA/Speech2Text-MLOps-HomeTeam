# import torch
# import whisper
# import librosa

# from .base_asr_model import BaseASRModel

# class WhisperModel(BaseASRModel):
#     def __init__(self):
#         self.model = whisper.load_model("base")

#     def transcribe(self, audio_path: str) -> str:
#         # Load and preprocess the audio file
#         audio, sr = librosa.load(audio_path, sr=16000)
#         audio = torch.tensor(audio).unsqueeze(0)

#         # Perform transcription
#         result = self.model.transcribe(audio)
#         transcription = result["text"]
#         return transcription
