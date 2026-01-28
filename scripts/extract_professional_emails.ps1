$sourceDir = 'C:\Users\willi\OneDrive\Bureau\Mails\All unique mails'
$destDir = 'C:\Users\willi\OneDrive\Bureau\Mails\All unique mails\Professional mails'

# Create destination directory if not exists
if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir -Force
}

# Free email domains to exclude (personal emails)
$freeEmailDomains = @(
    'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.fr', 'yahoo.co.uk', 'yahoo.de', 'yahoo.es', 'yahoo.it', 'yahoo.co.jp', 'yahoo.ca', 'yahoo.com.br', 'yahoo.com.mx', 'yahoo.com.au', 'yahoo.in', 'yahoo.co.in',
    'hotmail.com', 'hotmail.fr', 'hotmail.co.uk', 'hotmail.de', 'hotmail.es', 'hotmail.it', 'hotmail.co.jp',
    'outlook.com', 'outlook.fr', 'outlook.de', 'outlook.es', 'outlook.it', 'outlook.co.uk', 'outlook.jp',
    'live.com', 'live.fr', 'live.co.uk', 'live.de', 'live.nl', 'live.be',
    'msn.com', 'passport.com',
    'aol.com', 'aol.fr', 'aol.co.uk', 'aol.de',
    'icloud.com', 'me.com', 'mac.com',
    'mail.com', 'email.com', 'usa.com', 'post.com',
    'protonmail.com', 'proton.me', 'pm.me', 'tutanota.com', 'tutamail.com',
    'yandex.ru', 'yandex.com', 'ya.ru',
    'mail.ru', 'inbox.ru', 'list.ru', 'bk.ru',
    'qq.com', '163.com', '126.com', 'sina.com', 'sina.cn', 'sohu.com', 'aliyun.com', 'foxmail.com', '139.com', '189.cn', '21cn.com',
    'naver.com', 'hanmail.net', 'daum.net', 'nate.com', 'kakao.com',
    'wp.pl', 'onet.pl', 'interia.pl', 'o2.pl', 'poczta.fm', 'gazeta.pl', 'tlen.pl',
    'gmx.com', 'gmx.de', 'gmx.net', 'gmx.at', 'gmx.ch', 'gmx.fr',
    'web.de', 'freenet.de', 't-online.de', 'arcor.de', 'online.de',
    'orange.fr', 'sfr.fr', 'laposte.net', 'wanadoo.fr', 'free.fr', 'bbox.fr', 'neuf.fr', 'club-internet.fr', 'numericable.fr', 'voila.fr', 'alice.fr',
    'libero.it', 'virgilio.it', 'tin.it', 'tiscali.it', 'alice.it', 'fastwebnet.it',
    'terra.com.br', 'bol.com.br', 'uol.com.br', 'ig.com.br', 'globo.com', 'r7.com',
    'rocketmail.com', 'ymail.com', 'att.net', 'sbcglobal.net', 'bellsouth.net', 'comcast.net', 'verizon.net', 'cox.net', 'charter.net', 'earthlink.net', 'juno.com',
    'rediffmail.com', 'sify.com', 'in.com', 'indiatimes.com',
    'btinternet.com', 'sky.com', 'virgin.net', 'ntlworld.com', 'talktalk.net', 'blueyonder.co.uk', 'tiscali.co.uk',
    'bluewin.ch', 'sunrise.ch',
    'ziggo.nl', 'xs4all.nl', 'planet.nl', 'kpnmail.nl', 'hetnet.nl', 'home.nl', 'upcmail.nl', 'casema.nl', 'chello.nl',
    'telenet.be', 'skynet.be', 'proximus.be',
    'sapo.pt', 'clix.pt', 'iol.pt', 'netcabo.pt',
    'ono.com', 'telefonica.net', 'terra.es', 'ya.com',
    'seznam.cz', 'centrum.cz', 'volny.cz', 'atlas.cz', 'email.cz',
    'rambler.ru', 'pochta.ru', 'gmail.ru',
    'ukr.net', 'i.ua', 'meta.ua', 'bigmir.net',
    'abv.bg', 'mail.bg', 'dir.bg',
    'citromail.hu', 'freemail.hu', 'indamail.hu', 'vipmail.hu',
    'azet.sk', 'centrum.sk', 'post.sk', 'pobox.sk', 'zoznam.sk',
    'inbox.lv', 'one.lv', 'inbox.lt',
    'op.pl', 'poczta.onet.pl', 'autograf.pl',
    'bigpond.com', 'bigpond.net.au', 'optusnet.com.au', 'aapt.net.au', 'internode.on.net', 'westnet.com.au', 'tpg.com.au', 'iinet.net.au', 'dodo.com.au', 'netspace.net.au', 'adam.com.au', 'primus.com.au',
    'xtra.co.nz', 'clear.net.nz', 'ihug.co.nz', 'orcon.net.nz', 'paradise.net.nz', 'vodafone.co.nz', 'slingshot.co.nz'
)

# Convert to hashtable for faster lookup
$freeDomains = @{}
foreach ($domain in $freeEmailDomains) {
    $freeDomains[$domain] = $true
}

$results = @()
$totalProfessionalEmails = 0

Get-ChildItem -Path $sourceDir -Filter 'part_*.txt' | Sort-Object Name | ForEach-Object {
    $file = $_
    $totalCount = 0
    $professionalCount = 0
    $professionalEmails = [System.Collections.Generic.List[string]]::new()
    
    $reader = [System.IO.StreamReader]::new($file.FullName)
    while ($null -ne ($line = $reader.ReadLine())) {
        $email = $line.Trim().ToLower()
        if ($email -eq '') { continue }
        $totalCount++
        
        if ($email -match '@(.+)$') {
            $domain = $matches[1]
            
            # Keep email if domain is NOT in free email domains list
            if (-not $freeDomains.ContainsKey($domain)) {
                $professionalCount++
                $professionalEmails.Add($email)
            }
        }
    }
    $reader.Close()
    
    # Save professional emails to destination
    $destFile = Join-Path $destDir $file.Name
    [System.IO.File]::WriteAllLines($destFile, $professionalEmails)
    
    $percentage = if ($totalCount -gt 0) { [math]::Round(($professionalCount / $totalCount) * 100, 1) } else { 0 }
    
    $results += [PSCustomObject]@{
        File = $file.Name
        Total = $totalCount
        Professional = $professionalCount
        Percentage = $percentage
    }
    
    $totalProfessionalEmails += $professionalCount
    
    Write-Host "$($file.Name): $professionalCount / $totalCount professional emails ($percentage%)"
}

Write-Host ''
Write-Host '=========================================='
Write-Host '               SUMMARY                    '
Write-Host '=========================================='
$totalAll = ($results | Measure-Object -Property Total -Sum).Sum
$professionalAll = ($results | Measure-Object -Property Professional -Sum).Sum
$overallPercentage = [math]::Round(($professionalAll / $totalAll) * 100, 2)
Write-Host "Total emails scanned: $totalAll"
Write-Host "Professional emails:  $professionalAll"
Write-Host "Free/personal emails: $($totalAll - $professionalAll)"
Write-Host "Professional rate:    $overallPercentage%"
Write-Host ''
Write-Host "Professional emails saved to: $destDir"
