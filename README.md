# Speech2Text-MLOps-HomeTeam
## Overview
This project implements MLOps pipeline for Automatic Speech Recognition (ASR) using the wav2vec2 model (WIP: To be exposed to the search-ui frontend for quick transcription - but requires more resources). 

The deployed system (on Deployment URL: http://20.184.50.171:3000/)  includes a Elasticsearch backend for transcription search for a given csv, and a Search UI frontend wherein users can search for related content in the index!


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
│   ├── default.conf
│   ├── docker-compose.yml
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package-lock.json
│   ├── package.json
│   └── README.md
├── .gitignore
├── docker-compose.yml
└── README.md
```

## Deployment Instructions
1) Create VM, here we use B2ms since it has 8gb which is sufficient for 2-node elastic container setup
```bash
az vm create --resource-group htx-asr-system --name htx-ec-esearch --image Ubuntu2204 --size Standard_B2ms --admin-username htxadmin --data-disk-sizes-gb 10 --public-ip-address htx-SRS-ec-esearch-public-ip

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
sudo apt install docker-compose
# then exit and ssh back in

# check docker version
docker version
# Check
sysctl vm.max_map_count

sudo sysctl -w vm.max_map_count=262144

# persistent change to memory load
sudo nano /etc/sysctl.conf
## add 
vm.max_map_count=262144


# update system settings for elasticsearch
# sudo sysctl -w vm.max_map_count=262144

# create pem copy public key
ssh-keygen -m PEM -t rsa -b 4096 -f ~/.ssh/id_rsa.pem
cat ~/.ssh/id_rsa.pem.pub
# copy ssh keys to github settings

# mkdir projects
mkdir projects
cd projects 

# then clone
git clone git@github.com:shaikrezashafiqbSA/Speech2Text-MLOps-HomeTeam.git

# IF this fails, then 
# Verify Your SSH Key: Make sure your SSH key is added correctly and accessible. You can list your SSH keys with the following command:

sh
ls -la ~/.ssh
# Ensure your private key (id_rsa.pem or similar) and public key (id_rsa.pem.pub) are listed.

# Ensure SSH Key is Added to SSH Agent: Start the SSH agent and add your key:

sh
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_rsa.pem
# Check SSH Key Permissions: Ensure the private key has the correct permissions:

sh
chmod 600 ~/.ssh/id_rsa.pem
# Verify SSH Configuration: Check your SSH config file to ensure it's set up correctly. Open the config file:

sh
nano ~/.ssh/config
# Add the following configuration:

sh
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_rsa.pem
# Test SSH Connection: Test your SSH connection to GitHub:

sh
ssh -T git@github.com
# You should see a message like "Hi <username>! You've successfully authenticated, but GitHub does not provide shell access."

# Check for Multiple Keys: If you have multiple SSH keys, ensure that the correct key is being used. You can specify the key to use in your SSH config file as shown above.
# git pull to update
git pull origin main
```

4) Deploy elastic-backend and search-ui 

5) Deployment URL: http://20.184.50.171:3000/
Username and password given in submission email!

