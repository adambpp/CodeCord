FROM node:18-alpine

WORKDIR /app

# Copy files for server
COPY . .

# Install the package.json
RUN npm install

EXPOSE 3001

CMD ["node", "server.js"]