# Use Node.js 18 on Debian (closer to Windows dev environment)
FROM mcr.microsoft.com/devcontainers/typescript-node:1-18-bullseye

# Install pnpm globally
RUN npm install -g pnpm@latest

# Install Windows build tools (for native modules if needed)
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /workspace

# Default command
CMD ["/bin/bash"]
