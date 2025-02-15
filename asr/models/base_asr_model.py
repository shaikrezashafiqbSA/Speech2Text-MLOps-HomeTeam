from abc import ABC, abstractmethod
import numpy as np

class BaseASRModel(ABC):
    @abstractmethod
    def transcribe(self, audio_array: np.ndarray) -> str:
        pass
