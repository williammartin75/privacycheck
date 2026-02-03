#!/bin/bash
set -e

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Create work directory
mkdir -p /app
cd /app

# Download audit script
gsutil cp gs://privacychecker-domains-input/batch-audit.js .

# Get instance name to determine which chunk to process
INSTANCE_NAME=$(curl -s "http://metadata.google.internal/computeMetadata/v1/instance/name" -H "Metadata-Flavor: Google")
CHUNK_NUM=$(echo $INSTANCE_NAME | sed 's/audit-worker-//')
CHUNK_FILE=$(printf "chunk_%04d.txt" $CHUNK_NUM)

echo "Instance: $INSTANCE_NAME, Processing: $CHUNK_FILE"

# Download assigned chunk
gsutil cp gs://privacychecker-domains-input/$CHUNK_FILE domains.txt

# Run audit with 10 workers
node batch-audit.js --input domains.txt --output results --workers 10

# Upload results
gsutil -m cp results/*.json gs://privacychecker-results-output/$INSTANCE_NAME/

echo "Done! Shutting down..."

# Shutdown when done
poweroff
