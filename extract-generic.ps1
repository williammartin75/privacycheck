# Extract generic emails to separate file
$inputFile = "C:\Users\willi\OneDrive\Bureau\Mails\ALL_UNIQUE_EMAILS.txt"
$outputFile = "C:\Users\willi\OneDrive\Bureau\Mails\GENERIC_EMAILS.txt"

Write-Host "=== Extraction des emails generiques ===" -ForegroundColor Cyan

$prefixes = @(
    "info@", "contact@", "privacy@", "support@", "hello@", 
    "sales@", "admin@", "office@", "help@", "service@",
    "legal@", "compliance@", "dpo@", "gdpr@", "marketing@",
    "team@", "hr@", "security@", "noreply@", "webmaster@"
)

# Build regex pattern
$pattern = "^(" + ($prefixes -join "|") + ")"

Write-Host "Pattern: $pattern"
Write-Host "Extracting to: $outputFile"
Write-Host ""

# Use Select-String to extract matching lines
Write-Host "Extracting... (this will take a few minutes)" -ForegroundColor Yellow
$matches = Select-String -Path $inputFile -Pattern $pattern -CaseSensitive | ForEach-Object { $_.Line }

Write-Host "Writing $($matches.Count) emails to file..."
$matches | Set-Content -Path $outputFile

$fileSize = (Get-Item $outputFile).Length / 1MB

Write-Host ""
Write-Host "=== DONE ===" -ForegroundColor Green
Write-Host "Total generic emails: $($matches.Count.ToString('N0'))" -ForegroundColor Cyan
Write-Host "Output file: $outputFile" -ForegroundColor Cyan
Write-Host "File size: $($fileSize.ToString('F2')) MB" -ForegroundColor Cyan
