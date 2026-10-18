FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 8000

# Allow overriding command via build args or docker-compose command
ARG EXEC_COMMAND="npm start"
CMD ["sh", "-c", "${EXEC_COMMAND}"]