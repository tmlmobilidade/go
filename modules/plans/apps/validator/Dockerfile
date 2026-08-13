# Use Node.js 20 on Debian Bookworm as base image
FROM node:20-bookworm

# Create app directory
WORKDIR /app

# Copy all binaries first
COPY bin/ /app/bin/

# Copy the data directory
COPY data/ /app/data/

# Set proper permissions
RUN chmod +x /app/bin/validator-*

# Set the entrypoint
ENTRYPOINT ["/bin/bash", "-s"]
