# Script pour télécharger les fichiers depuis GCS sans gsutil
# Nécessite d'être authentifié via navigateur une seule fois

$bucket = "privacychecker-dns-scan-2026"
$destDir = "C:\Users\willi\OneDrive\Bureau\Mails"

$files = @(
    "DOMAINS_ALIVE.txt",
    "domains_worker07.txt", 
    "domains_worker10.txt"
)

Write-Host "=== Téléchargement depuis GCS ===" -ForegroundColor Cyan

foreach ($file in $files) {
    $url = "https://storage.googleapis.com/$bucket/$file"
    $dest = Join-Path $destDir $file
    
    Write-Host "Téléchargement de $file..." -ForegroundColor Yellow
    
    try {
        Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing
        $size = (Get-Item $dest).Length / 1MB
        Write-Host "  OK: $([math]::Round($size, 2)) MB" -ForegroundColor Green
    }
    catch {
        Write-Host "  ERREUR: $_" -ForegroundColor Red
        Write-Host "  Le fichier n'existe peut-être pas encore dans GCS" -ForegroundColor Yellow
    }
}

Write-Host "`nTerminé!" -ForegroundColor Cyan
