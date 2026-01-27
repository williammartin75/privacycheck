# Fast generic email counter using Select-String
$file = "C:\Users\willi\OneDrive\Bureau\Mails\ALL_UNIQUE_EMAILS.txt"

Write-Host "=== Comptage rapide des emails generiques ===" -ForegroundColor Cyan
Write-Host "Fichier: $file"
Write-Host ""

$prefixes = @(
    "info@", "contact@", "privacy@", "support@", "hello@", 
    "sales@", "admin@", "office@", "help@", "service@",
    "legal@", "compliance@", "dpo@", "gdpr@", "marketing@",
    "team@", "hr@", "security@", "noreply@", "webmaster@"
)

$results = @{}
$total = 0

foreach ($prefix in $prefixes) {
    Write-Host "Counting $prefix ..." -NoNewline
    $count = (Select-String -Path $file -Pattern "^$prefix" -CaseSensitive).Count
    $results[$prefix] = $count
    $total += $count
    Write-Host " $count" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== RESULTATS TRIES ===" -ForegroundColor Green
$results.GetEnumerator() | Where-Object { $_.Value -gt 0 } | Sort-Object Value -Descending | ForEach-Object {
    Write-Host ("{0,-20} : {1,10:N0}" -f $_.Key, $_.Value)
}

Write-Host ""
Write-Host "=== TOTAL EMAILS GENERIQUES: $($total.ToString('N0')) ===" -ForegroundColor Cyan
