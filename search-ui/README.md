### Install Dependencies (run these in your search-ui directory):

```bash
# generate password
docker run --rm -it -v ${PWD}:/host httpd:2.4-alpine sh -c "htpasswd -c /host/.htpasswd admin"

docker-compose build

docker-compose up

docker build --no-cache -t search-ui-search-ui-1 .


```