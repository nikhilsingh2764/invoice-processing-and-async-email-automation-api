FROM node:20-alpine

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./
# Production dependencies only (husky/eslint/prettier are not needed in the image)
RUN npm ci --omit=dev && npm cache clean --force

COPY . .

# Run as the unprivileged "node" user that ships with the base image
RUN chown -R node:node /app
USER node

EXPOSE 8000

# EXEC_COMMAND selects what the container runs: "npm start" (API) or "npm run worker" (workers).
# It must be an ENV (not only an ARG) so it is still defined when the container starts.
ARG EXEC_COMMAND="npm start"
ENV EXEC_COMMAND=${EXEC_COMMAND}
CMD ["sh", "-c", "${EXEC_COMMAND}"]
