
# lightweight python image
FROM python:3.9-slim
# 1) Set the working directory in the container to copy and install requirements.txt 
WORKDIR /app

# a) Copy requirements file into container
COPY requirements.txt .

# b) Install packages defined in reqreuiments.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the working directory contents into the container at /app
COPY . .

# working directory in container
WORKDIR /app/asr

# Expose port 8000 to za warudo
EXPOSE 8000

# run fastAPI app with uvicorn 
CMD ["uvicorn", "asr_api:app", "--host", "0.0.0.0", "--port", "8000"]