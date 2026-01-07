FROM node:20-alpine

WORKDIR /app

# Install dependencies for native modules and canvas
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    postgresql-client \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    pixman-dev \
    pkgconfig

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 8000

# Start server in development mode
CMD ["npm", "run", "dev"]

