FROM node:8 as builder
ADD . /rbbid-front
WORKDIR /rbbid-front
RUN npm install

RUN npm run-script build

FROM nginx

RUN ln -snf /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime

ADD nginx.conf /etc/nginx/
ADD default.conf /etc/nginx/conf.d/


# Copy result of build to nginx folder
COPY --from=builder /rbbid-front/dist /usr/share/nginx/html

# Expondo as portas necessárias
EXPOSE 8000

## package.json:
# scripts: {
#   postinstall: "cp -r ../bndes-ux4 node_modules/"
#   build: ng build --prod
# }
## 
