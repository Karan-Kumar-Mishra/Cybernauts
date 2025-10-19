FROM node:18-alpine

WORKDIR /app
RUN apk add --no-cache postgresql-client
COPY package*.json ./
RUN npm install
COPY . .
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.9.0/wait /wait
RUN chmod +x /wait
EXPOSE 5000
CMD ["sh", "-c", "/wait && npm run dev"]