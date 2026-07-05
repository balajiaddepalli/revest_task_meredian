FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN apk add --no-cache openssl && npm ci
COPY . .
RUN npx prisma generate && npm run build

EXPOSE 3004
CMD ["sh", "-c", "npx prisma db push && node dist/main"]
