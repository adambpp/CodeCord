FROM node:18-alpine

WORKDIR /app

# Copy files for server
COPY . .

# Install the package.json
RUN npm install

# Remove the existing bcrypt module
RUN rm -rf node_modules/bcrypt

# Reinstall bcrypt
RUN npm install bcrypt

EXPOSE 3001

CMD ["node", "server.js"]