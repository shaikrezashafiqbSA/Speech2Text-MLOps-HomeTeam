elastic-backend/
├── data/                  # Where we keep our CSV file
│   └── cs-valid-dev.csv
├── docker-compose.yml     # Instructions for running our containers
├── Dockerfile            # Instructions for building our Python app
├── requirements.txt      # List of Python packages we need
└── cv-index.py          # Our Python script to load data


How to run:
# Step 1: Start Elasticsearch
```bash
docker-compose up -d --build

docker-compose down --rmi all -v


# Step 2: Wait about 30 seconds for indexer to start

# Step 3: Run our Python script
python cv-index.py

# Step 4: Check if it worked
curl http://localhost:9200/cv-transcriptions/_count

'curl.exe -X GET "localhost:9200/cv-transcriptions/_search?pretty" -H "Content-Type: application/json" -d @query.json'


cmd /c 'curl.exe -X GET "localhost:9200/cv-transcriptions/_search?pretty" -H "Content-Type: application/json" -d @query1.json'
```