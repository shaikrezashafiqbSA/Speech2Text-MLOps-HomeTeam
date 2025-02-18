FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

COPY cv-index.py .
COPY cv-valid-dev.csv .

CMD ["python", "cv-index.py"]
