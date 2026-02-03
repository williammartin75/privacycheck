# 🚀 GCP Deployment - PrivacyChecker Batch Audit

## Configuration Finale

| Paramètre | Valeur |
|-----------|--------|
| **Domaines** | 12,000,000 |
| **Pages/domaine** | 20 |
| **Instances** | 600 e2-small |
| **Workers/instance** | 10 |
| **Durée estimée** | ~14 heures |
| **Coût estimé** | ~$175 |

---

## Étape 1 : Configurer GCP

```powershell
# Login
gcloud auth login

# Set project
gcloud config set project YOUR_PROJECT_ID

# Enable APIs
gcloud services enable compute.googleapis.com storage.googleapis.com artifactregistry.googleapis.com
```

---

## Étape 2 : Créer les buckets Storage

```powershell
# Bucket pour les domaines (input)
gsutil mb -l europe-west1 gs://privacychecker-domains-input/

# Bucket pour les résultats (output)
gsutil mb -l europe-west1 gs://privacychecker-results-output/
```

---

## Étape 3 : Préparer les fichiers de domaines

### 3.1 Combiner et nettoyer les fichiers

```powershell
# Dans le dossier URLS, combiner tous les fichiers
cd "C:\Users\willi\OneDrive\Bureau\Mails\All unique mails\Professional mails\URLS"

# Combiner tous les fichiers .txt
Get-Content *.txt | Where-Object { 
    $_ -match '^[a-zA-Z0-9][a-zA-Z0-9-_.]*\.[a-zA-Z]{2,}$' -and 
    $_.Length -gt 3 -and 
    $_.Length -lt 256 
} | Sort-Object -Unique | Out-File -Encoding UTF8 all_domains_clean.txt
```

### 3.2 Splitter en chunks de 20,000

```powershell
# Script PowerShell pour splitter
$content = Get-Content all_domains_clean.txt
$chunkSize = 20000
$chunkNum = 0

for ($i = 0; $i -lt $content.Length; $i += $chunkSize) {
    $chunk = $content[$i..([Math]::Min($i + $chunkSize - 1, $content.Length - 1))]
    $filename = "chunk_{0:D4}.txt" -f $chunkNum
    $chunk | Out-File -Encoding UTF8 "chunks/$filename"
    $chunkNum++
    Write-Host "Created $filename with $($chunk.Length) domains"
}

Write-Host "Total: $chunkNum chunks"
```

### 3.3 Upload vers GCS

```powershell
gsutil -m cp chunks/*.txt gs://privacychecker-domains-input/
```

---

## Étape 4 : Build & Push Docker

```powershell
cd C:\Users\willi\OneDrive\Bureau\privacycheck\scripts

# Créer Artifact Registry repo
gcloud artifacts repositories create privacychecker --repository-format=docker --location=europe-west1

# Auth Docker
gcloud auth configure-docker europe-west1-docker.pkg.dev

# Build
docker build -t europe-west1-docker.pkg.dev/YOUR_PROJECT_ID/privacychecker/batch-audit:v3 .

# Push
docker push europe-west1-docker.pkg.dev/YOUR_PROJECT_ID/privacychecker/batch-audit:v3
```

---

## Étape 5 : Créer le script de lancement

Créer `launch-workers.sh` ou exécuter dans Cloud Shell :

```bash
#!/bin/bash
PROJECT_ID="YOUR_PROJECT_ID"
ZONE="europe-west1-b"
MACHINE_TYPE="e2-small"
IMAGE="europe-west1-docker.pkg.dev/$PROJECT_ID/privacychecker/batch-audit:v3"

# Liste des chunks
CHUNKS=$(gsutil ls gs://privacychecker-domains-input/ | grep chunk_ | while read chunk; do basename "$chunk"; done)

INSTANCE_NUM=0
for CHUNK in $CHUNKS; do
    INSTANCE_NAME="audit-worker-${INSTANCE_NUM}"
    
    gcloud compute instances create-with-container "$INSTANCE_NAME" \
        --zone="$ZONE" \
        --machine-type="$MACHINE_TYPE" \
        --container-image="$IMAGE" \
        --container-arg="--input" \
        --container-arg="/input/$CHUNK" \
        --container-arg="--output" \
        --container-arg="/output" \
        --container-arg="--workers" \
        --container-arg="10" \
        --container-mount-host-path="host-path=/mnt/input,mount-path=/input" \
        --container-mount-host-path="host-path=/mnt/output,mount-path=/output" \
        --scopes=cloud-platform \
        --metadata="startup-script=gsutil cp gs://privacychecker-domains-input/$CHUNK /mnt/input/$CHUNK && sleep 3600 && gsutil -m cp /mnt/output/* gs://privacychecker-results-output/worker-$INSTANCE_NUM/" \
        --async
    
    INSTANCE_NUM=$((INSTANCE_NUM + 1))
    
    # Rate limit: 10 instances per second
    if [ $((INSTANCE_NUM % 10)) -eq 0 ]; then
        sleep 1
        echo "Launched $INSTANCE_NUM instances..."
    fi
done

echo "Total launched: $INSTANCE_NUM instances"
```

---

## Étape 6 : Monitoring

```bash
# Compter les instances actives
gcloud compute instances list --filter="name~audit-worker" | wc -l

# Voir les résultats uploadés
gsutil ls gs://privacychecker-results-output/ | wc -l

# Logs d'une instance
gcloud compute instances get-serial-port-output audit-worker-0 --zone=europe-west1-b
```

---

## Étape 7 : Récupérer les résultats

```powershell
# Télécharger tous les résultats
mkdir results
gsutil -m cp -r gs://privacychecker-results-output/* ./results/

# Merger les résultats
node merge-results.js --input ./results --output final-results.json
```

---

## Étape 8 : Cleanup

```bash
# Supprimer toutes les instances
gcloud compute instances list --filter="name~audit-worker" --format="value(name,zone)" | while read name zone; do
    gcloud compute instances delete "$name" --zone="$zone" --quiet &
done

# Optionnel: supprimer les buckets
# gsutil rm -r gs://privacychecker-domains-input/
# gsutil rm -r gs://privacychecker-results-output/
```

---

## Résumé des coûts

| Ressource | Quantité | Prix unitaire | Total |
|-----------|----------|---------------|-------|
| e2-small × 14h | 600 | $0.0168/h | $141 |
| Network egress | ~300GB | $0.12/GB | $36 |
| Cloud Storage | 20GB | $0.02/GB | $0.40 |
| **TOTAL** | | | **~$178** |
