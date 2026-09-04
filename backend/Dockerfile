FROM node:22-bookworm-slim

# Install system dependencies for Typst CLI and Argon2 native build
RUN apt-get update && apt-get install -y curl xz-utils python3 make g++ && \
    curl -fsSL https://github.com/typst/typst/releases/latest/download/typst-x86_64-unknown-linux-musl.tar.xz | \
    tar -xJ --strip-components=1 -C /usr/local/bin && \
    apt-get purge -y curl xz-utils && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start:dev"]