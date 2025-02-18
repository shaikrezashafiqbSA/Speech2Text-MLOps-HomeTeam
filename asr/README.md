ASR Service: Provides speech-to-text transcription via FastAPI with Uvicorn ASGI 

Why FastAPI? 
**FastAPI** is a modern web framework for building APIs with Python 3.7+ that is known for its high performance, ease of use, and robust features. Chosen because:
- **Volume**: asynchronous programming enables handling of multiple requests concurrently
- **High performance**: Extremely fast

Why Uvicorn?
**Uvicorn** is a high-performance ASGI server that runs FastAPI applications. Chosen because:
- **ASGI Support**: Enables high concurrency and asynchronous capabilities


Elasticsearch Backend: Stores and indexes transcriptions
Search UI: Web interface for searching transcriptions
Monitoring Pipeline: Tracks model performance and system health

### 1) Set up

#### a) Containerisation
```bash
# Build the docker image
docker build -t asr-api .

# Run container background/detached mode (-d), publish port 8001 in container to host port 8001 (-p), using image asr-api naming it as asr-api
docker run -d -p 8001:8001 --name asr-api asr-api

# Check if container is running
docker ps

# Should return something like...
CONTAINER ID   IMAGE     COMMAND                  CREATED         STATUS         PORTS                    NAMES
31298fa5e4a9   asr-api   "uvicorn asr_api:app…"   7 seconds ago   Up 6 seconds   0.0.0.0:8001->8001/tcp   asr-api  

# Check logs to confirm FastAPI app using Uvicorn 
docker logs asr-api

# should return ...
INFO:     Started server process [1]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8001 (Press CTRL+C to quit)

# REBUILD: stop and removing container
docker stop asr-api
docker rm asr-api



```

#### b) Testing endpoints

##### a) Healthcheck endpoint
```bash
curl http://localhost:8001/ping

# should return ...
INFO:asr_api:Ping endpoint was called
INFO:     172.17.0.1:42670 - "GET /ping HTTP/1.1" 200 OK
```

##### a) asr endpoint
```bash
> curl.exe -F "file=@D:\data\cv-valid-dev\cv-valid-dev\sample-002557.mp3" http://localhost:8001/asr

# should return ...
{"transcription":"ALL THAT TIME THE MARTIANS MUST HAVE BEEN GETTING READY","duration":"60.8","resample_time":"5.3"}
```

##### c) Checking for temp files
```bash
# peek into container
docker exec -it asr-api bash

# check where temporary files might be stored 
root@c1c15c9b0d29:/app/asr# ls /tmp
tmp_hzb6sni  tmpnyxcsgdkcacert.pem

# Upon service startup we see these tmp files, which is unrelated to the ASR processing (.pem is a temp SSL certificate)
```


<font color="red">*BEFORE FIX*</font>

Sending requests to asr endpoint we see that these temp files are produced and kept around: 
Then we call /asr for the first time 
```bash
curl.exe -F "file=@D:\data\cv-valid-dev\cv-valid-dev\sample-002559.mp3" http://localhost:8001/asr
```
which results in...
```bash
root@c1c15c9b0d29:/app/asr# ls /tmp
tmp_hzb6sni  tmpnyxcsgdkcacert.pem  tmppvi2swm9
```
Then another /asr for the second time results in ...
```bash
root@c1c15c9b0d29:/app/asr# ls /tmp
tmp0dn3ru1r  tmp_hzb6sni  tmpnyxcsgdkcacert.pem  tmppvi2swm9
```
<font color="green">*AFTER FIX*</font>

os.unlink(audio_path) at asr_api.py ln75
multiple /asr calls shows consistent:
```bash
root@c1c15c9b0d29:/app/asr# ls /tmp
tmp_hzb6sni  tmpnyxcsgdkcacert.pem
```