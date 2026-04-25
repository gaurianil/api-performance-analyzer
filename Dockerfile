FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# IMPORTANT: ensure frontend is built
WORKDIR /app/frontend
RUN npm install
RUN npm run build

WORKDIR /app

# copy build to backend dist
RUN cp -r frontend/dist dist

EXPOSE 3000

CMD ["node", "server.js"]