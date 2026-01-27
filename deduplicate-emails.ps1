# Script to deduplicate emails from multiple files
Write-Host "=== Email Deduplication Script ===" -ForegroundColor Cyan
Write-Host "This will process 14.5GB of emails. Estimated time: 30-60 minutes"
Write-Host ""

$inputPath = "C:\Users\willi\OneDrive\Bureau\Mails"
$outputFile = "C:\Users\willi\OneDrive\Bureau\Mails\ALL_UNIQUE_EMAILS.txt"

# Use HashSet for O(1) lookups
$uniqueEmails = [System.Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)

# Get all input files
$files = Get-ChildItem -Path $inputPath -Filter "emails_gdpr-*.txt"
$totalFiles = $files.Count
$currentFile = 0

Write-Host "Found $totalFiles files to process" -ForegroundColor Yellow
Write-Host ""

foreach ($file in $files) {
    $currentFile++
    $startTime = Get-Date
    Write-Host "[$currentFile/$totalFiles] Processing: $($file.Name)" -ForegroundColor Green
    
    # Use StreamReader for memory efficiency
    $reader = [System.IO.StreamReader]::new($file.FullName)
    $linesInFile = 0
    
    while ($null -ne ($line = $reader.ReadLine())) {
        $trimmed = $line.Trim()
        if ($trimmed) {
            [void]$uniqueEmails.Add($trimmed.ToLower())
            $linesInFile++
        }
    }
    $reader.Close()
    
    $elapsed = (Get-Date) - $startTime
    Write-Host "  -> Lines: $linesInFile | Unique total: $($uniqueEmails.Count) | Time: $($elapsed.TotalSeconds.ToString('F1'))s" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Writing $($uniqueEmails.Count) unique emails to file..." -ForegroundColor Yellow

$writer = [System.IO.StreamWriter]::new($outputFile)
foreach ($email in $uniqueEmails) {
    $writer.WriteLine($email)
}
$writer.Close()

$fileSize = (Get-Item $outputFile).Length / 1MB
Write-Host ""
Write-Host "=== DONE ===" -ForegroundColor Green
Write-Host "Total unique emails: $($uniqueEmails.Count)" -ForegroundColor Cyan
Write-Host "Output file: $outputFile" -ForegroundColor Cyan
Write-Host "Output size: $($fileSize.ToString('F2')) MB" -ForegroundColor Cyan
