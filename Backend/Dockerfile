FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

# Add --ignore-scripts to skip running 'prepare' scripts (like husky) in production
RUN npm ci --omit=dev --ignore-scripts

COPY . .

RUN chown -R node:node /app

USER node

EXPOSE 8000

CMD ["npm", "start"]