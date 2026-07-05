FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN apk add --no-cache openssl curl && npm install
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["sh", "/app/entrypoint.sh"]
