FROM node:18-slim
WORKDIR /usr/src/app
COPY package.json package-lock.json* ./
RUN npm install --production --no-audit --no-fund
COPY . .
EXPOSE 8080
CMD ["node", "index.js"]
