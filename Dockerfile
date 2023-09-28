FROM node:lts-slim

ADD . /root/volume

WORKDIR /root/volume

RUN npm i

EXPOSE 5000
