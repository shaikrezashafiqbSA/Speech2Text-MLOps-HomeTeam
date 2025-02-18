from elasticsearch import Elasticsearch
from elasticsearch.helpers import bulk
import pandas as pd
import logging
import time
import requests

# Set up logging to see what's happening
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s',
                    datefmt='%Y-%m-%d %H:%M:%S')
logger = logging.getLogger(__name__)

# Where to find Elasticsearch
ES_HOST = "es01"
ES_PORT = "9200"
INDEX_NAME = "cv-transcriptions" 

def create_index(es):
    """Create index with mapping if it doesn't exist"""
    mapping = {
        "mappings": {
            "properties": {
                "generated_text": {"type": "text"},
                "duration": {"type": "float"},
                "age": {"type": "keyword"},
                "gender": {"type": "keyword"},
                "accent": {"type": "keyword"}
            }
        }
    }
    
    if not es.indices.exists(index=INDEX_NAME):
        es.indices.create(index=INDEX_NAME, body=mapping)
        logger.info(f"Created index: {INDEX_NAME}")


def generate_actions(df):
    """Generate actions for bulk indexing"""
    for i, row in df.iterrows():
        yield {
            "_index": INDEX_NAME,
            "_id": i,
            "_source": {
                "generated_text": row["generated_text"],
                "duration": row["duration"],
                "age": row["age"],
                "gender": row["gender"],
                "accent": row["accent"]
            }
        }

def wait_for_elasticsearch(es_url, retries=60, delay=10):
    for _ in range(retries):
        try:
            response = requests.get(es_url)
            if response.status_code == 200:
                logger.info("Elasticsearch is up and running!")
                return True
        except requests.exceptions.ConnectionError:
            logger.info(f"Elasticsearch not ready, retrying in {delay} seconds...")
            time.sleep(delay)
    return False

def cv_transcribe(path_to_csv):
    # Step 1: Connect to Elasticsearch
    logger.info("Waiting 30s before connecting to Elasticsearch...")
    time.sleep(30)
    logger.info("attempt connecting to Elasticsearch...")

    es_url = f'http://{ES_HOST}:{ES_PORT}'
    logger.info("Connecting to Elasticsearch...")

    # Wait for Elasticsearch to be ready
    if not wait_for_elasticsearch(es_url):
        logger.error("Elasticsearch is not ready after multiple retries.")
        return

    es = Elasticsearch([es_url])
    
    # Step 2: Create a place to store our data
    create_index(es)
    
    # Step 3: Load and index our CSV data
    logger.info("Loading CSV file...")
    df = pd.read_csv(path_to_csv)

    # Ensure no nans in df
    df = df.fillna({
        'generated_text': '',
        'age': '',
        'gender': '',
        'accent': ''
    })
    
    # Convert all string columns 
    string_columns = ['generated_text', 'age', 'gender', 'accent']
    df[string_columns] = df[string_columns].astype(str)

    # Bulk index
    logger.info(f"Bulk indexing {len(df)} documents...")
    success, failed = bulk(es, 
                            generate_actions(df),
                            chunk_size=10,  # Process 1000 documents at a time
                            raise_on_error=False
                        )
    
    logger.info(f"Indexed {success} documents successfully")
    if failed:
        logger.warning(f"Failed to index {len(failed)} documents")

if __name__ == "__main__":
    cv_transcribe('cv-valid-dev.csv')