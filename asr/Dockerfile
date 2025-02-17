
# lightweight python image
FROM python:3.9-slim
# 1) Set the working directory in the container to copy and install requirements.txt 
WORKDIR /app

# a) Copy requirements file into container
COPY requirements.txt .

# b) Install packages defined in reqreuiments.txt
RUN pip install --no-cache-dir -r requirements.txt

# create asr dir
RUN mkdir -p /app/asr

# Copy only necessary files from asr directory
COPY asr_api.py .
COPY models/ ./models/


# Expose port 8001 to za warudo
EXPOSE 8001

# run fastAPI app with uvicorn 
CMD ["uvicorn", "asr_api:app", "--host", "0.0.0.0", "--port", "8001"]