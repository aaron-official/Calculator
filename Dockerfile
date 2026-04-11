# Stage 1: Build Rust
FROM rust:1.85-slim-bullseye AS rust-builder
WORKDIR /app/Rust
COPY Rust/ .
RUN cargo build --release --bin calculator

# Stage 2: Build Web
FROM node:20-bullseye AS web-builder
WORKDIR /app/web
COPY web/package*.json ./
RUN npm ci
COPY web/ .
RUN npm run build

# Stage 3: Runner
FROM node:20-bullseye-slim
WORKDIR /app

# Install Python and uv
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    curl \
    && curl -LsSf https://astral.sh/uv/install.sh | sh \
    && ln -s /root/.local/bin/uv /usr/local/bin/uv \
    && rm -rf /var/lib/apt/lists/*

# Copy Python part
WORKDIR /app/Python
COPY Python/ .
RUN uv sync

# Copy Rust binary
WORKDIR /app/Rust
COPY --from=rust-builder /app/Rust/target/release/calculator ./calculator
RUN chmod +x ./calculator

# Copy Web build and runtime
WORKDIR /app/web
COPY --from=web-builder /app/web/public ./public
COPY --from=web-builder /app/web/.next ./.next
COPY --from=web-builder /app/web/node_modules ./node_modules
COPY --from=web-builder /app/web/package.json ./package.json

EXPOSE 3000

ENV NODE_ENV=production
CMD ["npm", "start"]
