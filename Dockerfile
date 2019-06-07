FROM node:alpine
WORKDIR /app
COPY . .
RUN npm i 
EXPOSE 3000
USER root
 
ENV phonegap.username=
ENV phonegap.password=
CMD [ "node", "dist/start.js" ]