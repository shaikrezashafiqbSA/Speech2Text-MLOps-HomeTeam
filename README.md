# Speech2Text-MLOps-HomeTeam
## Overview
This project implements a complete MLOps pipeline for Automatic Speech Recognition (ASR) using the wav2vec2 model. The system includes a containerized ASR service, Elasticsearch backend for transcription search, and a Search UI frontend.


## Architecture
The system consists of four main components:
```bash
MLOPS-TEST/
├── asr/
│   ├── models/
│   │   ├── _init_.py
│   │   ├── base_asr_model.py
│   │   └── wav2vec2_model.py
│   ├── _init_.py
│   ├── asr_api.py
│   ├── cv-decode.py
│   ├── Dockerfile
│   └── requirements.txt
├── deployment-design/
│   └── design.pdf
├── elastic-backend/
│   ├── cv-index.py
│   ├── cv-valid-dev.csv
│   ├── docker-compose.yml
│   ├── query.json
│   ├── README.md
│   └── requirements.txt
├── search-ui/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── app.js
│   │   └── index.js
│   ├── docker-compose.yml
│   ├── Dockerfile
│   ├── package.json
│   └── README.md
├── .gitignore
├── docker-compose.yml
└── README.md
```

## Deployment Instructions
1) Generate SSH Key



2) Create VM
```bash
az vm create --resource-group htx-asr-system --name htx-ec-esearch --image Ubuntu2204 --size Standard_B2ms --admin-username htxadmin --data-disk-sizes-gb 1 --public-ip-address htx-SRS-ec-esearch-public-ip

```
 
3) SSH into VM
```bash
# ssh
ssh -i ~/.ssh/id_rsa htxadmin@52.163.204.0

# updates and install 
sudo apt-get update

# docker
sudo apt-get install docker.io
sudo usermod -aG docker $USER

# check docker version
docker version


# start docker
# sudo systemctl start docker
# sudo systemctl enable docker


# create pem copy public key
ssh-keygen -m PEM -t rsa -b 4096 -f ~/.ssh/id_rsa.pem

#clone
git clone git@github.com:shaikrezashafiqbSA/Speech2Text-MLOps-HomeTeam.git

# git pull to update
git pull origin main
```

4) 

