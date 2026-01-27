# Extract unique domains from generic emails
Write-Host "=== Extracting unique domains ===" -ForegroundColor Cyan

$inputFile = "C:\Users\willi\OneDrive\Bureau\Mails\GENERIC_EMAILS.txt"
$outputFile = "C:\Users\willi\OneDrive\Bureau\Mails\UNIQUE_DOMAINS.txt"

Write-Host "Reading emails..."
$domains = [System.Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)

$reader = [System.IO.StreamReader]::new($inputFile)
$count = 0

while ($null -ne ($line = $reader.ReadLine())) {
    $parts = $line -split '@'
    if ($parts.Length -eq 2) {
        [void]$domains.Add($parts[1].ToLower())
    }
    $count++
    if ($count % 1000000 -eq 0) {
        Write-Host "  Processed $($count / 1000000)M emails, $($domains.Count) unique domains..."
    }
}
$reader.Close()

Write-Host ""
Write-Host "Writing $($domains.Count) unique domains to file..."
$domains | Set-Content -Path $outputFile

Write-Host ""
Write-Host "=== DONE ===" -ForegroundColor Green
Write-Host "Total emails processed: $($count.ToString('N0'))"
Write-Host "Unique domains: $($domains.Count.ToString('N0'))"
Write-Host "Output: $outputFile"
