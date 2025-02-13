from abc import ABC, abstractmethod

class BaseASRModel(ABC):
    @abstractmethod
    def transcribe(self, audio_path: str) -> str:
        pass
