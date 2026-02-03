#!/bin/bash
# Orchestrator script - manages all audit waves automatically

PROJECT="project-d9dd28ed-833d-4e90-969"
ZONE="europe-west1-b"
TEMPLATE="audit-worker-template"
TOTAL_CHUNKS=618
BATCH_SIZE=50
LOG_FILE="/var/log/orchestrator.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

log "=== STARTING ORCHESTRATOR ==="
log "Total chunks: $TOTAL_CHUNKS, Batch size: $BATCH_SIZE"

for ((wave=0; wave*BATCH_SIZE < TOTAL_CHUNKS; wave++)); do
    start=$((wave * BATCH_SIZE))
    end=$((start + BATCH_SIZE))
    if [ $end -gt $TOTAL_CHUNKS ]; then end=$TOTAL_CHUNKS; fi
    
    log "--- WAVE $((wave+1)): instances $start to $((end-1)) ---"
    
    # Launch all instances in this wave
    for ((i=start; i<end; i++)); do
        gcloud compute instances create "audit-worker-$i" \
            --project=$PROJECT \
            --zone=$ZONE \
            --source-instance-template=$TEMPLATE \
            --async 2>/dev/null
    done
    
    log "Launched $((end-start)) instances. Waiting for completion..."
    
    # Wait for all instances to terminate (they self-destruct after completing)
    sleep 120  # Initial wait for instances to start
    
    while true; do
        running=$(gcloud compute instances list \
            --project=$PROJECT \
            --filter="name~audit-worker-[0-9]+ AND status=RUNNING" \
            --format="value(name)" 2>/dev/null | wc -l)
        
        if [ "$running" -eq 0 ]; then
            log "Wave $((wave+1)) complete!"
            break
        fi
        
        log "Still running: $running instances..."
        sleep 60
    done
    
    # Small delay between waves
    sleep 30
done

log "=== ALL WAVES COMPLETE ==="
log "Results should be in: gs://privacychecker-results-output/"

# Count results
result_count=$(gsutil ls gs://privacychecker-results-output/ 2>/dev/null | wc -l)
log "Total result files: $result_count"

log "Orchestrator shutting down..."
# Shutdown the orchestrator VM
sudo poweroff
