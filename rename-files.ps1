# Rename script for debate files
$ErrorActionPreference = "Stop"

function Get-ArgumentTitle {
    param([string]$FilePath)
    
    if (Test-Path $FilePath) {
        $content = Get-Content $FilePath -Raw -Encoding UTF8
        if ($content -match '## 论据标题\s*\n*\s*(.+?)(?=\s*\n##|\s*\n*$)') {
            return $Matches[1].Trim()
        }
    }
    return $null
}

function Get-ArgumentType {
    param([string]$FileName)
    
    if ($FileName -match '立论') { return 'Opening' }
    elseif ($FileName -match '总结陈词') { return 'Summary' }
    elseif ($FileName -match '深化论证') { return 'Deepening' }
    elseif ($FileName -match '最终论证') { return 'Final_Argument' }
    elseif ($FileName -match '反驳|回应|驳论') { 
        if ($FileName -match '终极反驳|终极打脸|致命反击|致命一击|全面驳斥') { return 'Ultimate_Rebuttal' }
        elseif ($FileName -match '乘胜追击|主动进攻') { return 'Offensive' }
        else { return 'Response' }
    }
    elseif ($FileName -match '终极判决|终局判决|最终判决') { return 'Verdict' }
    else { return 'Debate' }
}

function New-FriendlyName {
    param(
        [string]$OriginalName,
        [string]$Title,
        [string]$ArgumentType
    )
    
    if ($OriginalName -match '第(\d+)轮') {
        $round = [int]$Matches[1]
        $roundStr = "{0:D2}" -f $round
    } else {
        $roundStr = "00"
    }
    
    if ($Title) {
        $cleanTitle = $Title -replace '[\\/:*?"<>|]', '_' -replace '\s+', '_'
        if ($cleanTitle.Length -gt 25) {
            $cleanTitle = $cleanTitle.Substring(0, 25)
        }
    } else {
        $cleanTitle = 'Untitled'
    }
    
    return "${roundStr}_${ArgumentType}_${cleanTitle}.md"
}

# Process Pro folder
$proPath = "D:\Code\AiArgue\public\正方"
if (Test-Path $proPath) {
    Write-Host "`n=== Processing Pro Folder ===" -ForegroundColor Cyan
    
    Get-ChildItem $proPath -Filter "*.md" | ForEach-Object {
        $title = Get-ArgumentTitle $_.FullName
        $argType = Get-ArgumentType $_.Name
        $newName = New-FriendlyName -OriginalName $_.Name -Title $title -ArgumentType $argType
        
        if ($newName -ne $_.Name) {
            $newPath = Join-Path $proPath $newName
            if (-not (Test-Path $newPath)) {
                Write-Host "Rename: $($_.Name) -> $($newName)" -ForegroundColor Green
                Rename-Item -Path $_.FullName -NewName $newName -Force
            } else {
                Write-Host "Skip (exists): $($_.Name)" -ForegroundColor Yellow
            }
        }
    }
}

# Process Con folder
$conPath = "D:\Code\AiArgue\public\反方"
if (Test-Path $conPath) {
    Write-Host "`n=== Processing Con Folder ===" -ForegroundColor Cyan
    
    Get-ChildItem $conPath -Filter "*.md" | ForEach-Object {
        $title = Get-ArgumentTitle $_.FullName
        $argType = Get-ArgumentType $_.Name
        $newName = New-FriendlyName -OriginalName $_.Name -Title $title -ArgumentType $argType
        
        if ($newName -ne $_.Name) {
            $newPath = Join-Path $conPath $newName
            if (-not (Test-Path $newPath)) {
                Write-Host "Rename: $($_.Name) -> $($newName)" -ForegroundColor Green
                Rename-Item -Path $_.FullName -NewName $newName -Force
            } else {
                Write-Host "Skip (exists): $($_.Name)" -ForegroundColor Yellow
            }
        }
    }
}

Write-Host "`nDone!" -ForegroundColor Green
