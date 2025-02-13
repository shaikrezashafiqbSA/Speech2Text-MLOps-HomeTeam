# Speech2Text-MLOps-HomeTeam
## Overview
This project implements a complete MLOps pipeline for Automatic Speech Recognition (ASR) using the wav2vec2 model. The system includes a containerized ASR service, Elasticsearch backend for transcription search, and a Search UI frontend.
## Architecture
The system consists of four main components:

ASR Service: Provides speech-to-text transcription via REST API
Elasticsearch Backend: Stores and indexes transcriptions
Search UI: Web interface for searching transcriptions
Monitoring Pipeline: Tracks model performance and system health
