FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN apk add --no-cache openssl && npm ci
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["node", "dist/main"]
