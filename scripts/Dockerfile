# PrivacyChecker Batch Audit - Docker Image
# Node.js 20 LTS for native fetch support

FROM node:20-alpine

WORKDIR /app

# Copy the audit script
COPY batch-audit.js .

# Create results directory
RUN mkdir -p /app/results

# Environment variables (can be overridden)
ENV WORKERS=15
ENV TIMEOUT_MS=8000

# Entry point
ENTRYPOINT ["node", "batch-audit.js"]

# Default command (override with actual input file)
CMD ["--help"]
