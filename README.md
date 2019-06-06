# Hybrid app maker

## How to run

To run project:

before starting make sure settings in .env file is valid. if you don't have .env file, create one using example.env

```bash

# install gulp
npm i gulp -g

# install dependencies
npm i

# run entry file
npm start

# To test
npm test

```

Tests will be covered with mocha and Documenting will be done using TypeDoc

Project uses Typescript + tslint to make sure of readability and maintainability of the code.

Suggested IDE for this project is vscode you could use it with combination of following extensions.

```bash
 code --install-extension CoenraadS.bracket-pair-colorizer
 code --install-extension eamodio.gitlens
 code --install-extension kisstkondoros.typelens
 code --install-extension SonarSource.sonarlint-vscode
 code --install-extension usernamehw.errorlens
 code --install-extension waderyan.gitblame
```

## Docker image

```bash
github_user=mognia ;\
docker_user=mognia ;\
project=appMaker; \
rm /home/sources/${project}/* -r; \
rm /home/sources/${project}/.\* -r; \
git clone https://github.com/${github_user}/${project}.git /home/sources/${project}; \
cat /home/sources/${project}/Dockerfile; \
sudo docker rmi ${docker_user}/${project} --force ; \
sudo docker build -t ${docker_user}/${project} /home/sources/${project} ; \
sudo docker rm ${project} --force ;
```

## Docker container

```bash
github_user=mognia ;\
docker_user=mognia ;\
project=appMaker; \
front=appMaker.mognia.ir ; \
docker run -p 2040:80 --name ${project} \
 --restart always \
 -e db.mongoDb=test \
 -e db.mongoUrl=mongodb://mongo:27017 \
 -e db.authSource=admin \
 -e db.user=root \
 -e db.password= \
 -e email.host=test.com \
 -e email.username=system@test.com \
 -e email.password= \
 -e email.port=587 \
 -e email.ssl=false \
 -e smsIr.lineNumber=  \
 -e smsIr.apiKey=  \
 -e smsIr.secretKey=  \
 -l traefik.backend=${project} \
 -l traefik.docker.network=bridge \
 -l traefik.enable=true \
 -l traefik.frontend.entryPoints=http,https \
 -l traefik.frontend.rule=Host:${front} \
 -l traefik.port=80 \
 -v /etc/localtime:/etc/localtime \
 ${docker_user}/${project};

```

## Docker hub

```bash
docker_user=mognia ;\
project=appMaker; \
docker push ${docker_user}/${project};
```
