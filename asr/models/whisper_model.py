# import torch
# import whisper

# from .base_asr_model import BaseASRModel

# class WhisperModel(BaseASRModel):
#     def __init__(self):
#         self.model = whisper.load_model("base")

#     def transcribe(self, audio_array: np.ndarray) -> str:
#         # Load and preprocess the audio file
#         audio = torch.tensor(audio_array).unsqueeze(0)

#         # Perform transcription
#         result = self.model.transcribe(audio)
#         transcription = result["text"]
#         return transcription
