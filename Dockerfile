# =========================
# STAGE 1: BUILD FRONTEND
# =========================
FROM node:18 AS frontend

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build


# =========================
# STAGE 2: BACKEND
# =========================
FROM node:18

WORKDIR /app

# install backend deps
COPY package*.json ./
RUN npm install

# copy backend source
COPY . .

# copy frontend build output
COPY --from=frontend /app/frontend/dist /app/dist

EXPOSE 3000

CMD ["node", "server.js"]