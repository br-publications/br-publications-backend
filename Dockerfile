# Build stage
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine

# Install netcat for wait-for-it script
RUN apk add --no-cache netcat-openbsd

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/src/migrations ./src/migrations
COPY --from=build /app/src/config ./src/config
COPY --from=build /app/.sequelizerc ./.sequelizerc
COPY --from=build /app/scripts ./scripts

RUN chmod +x scripts/wait-for-it.sh

EXPOSE 5000

CMD ["npm", "run", "start"]
