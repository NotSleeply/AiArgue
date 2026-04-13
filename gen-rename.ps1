# Batch rename script for remaining files
$ErrorActionPreference = "SilentlyContinue"

function Get-Title {
    param([string]$f)
    $c = Get-Content $f -Raw -Encoding UTF8
    if ($c -match '## 论据标题\s*\n*\s*(.+?)\s*\r?\n') { return $Matches[1].Trim().Substring(0, [Math]::Min(20, $Matches[1].Trim().Length)) }
    return "Untitled"
}

$base = "D:\Code\AiArgue\public\正方"
Get-ChildItem $base -Filter "第*.md" | ForEach-Object {
    $t = Get-Title $_.FullName
    if ($_.Name -match '第(\d+)轮') {
        $r = "{0:D2}" -f [int]$Matches[1]
        $type = "Response"
        if ($_.Name -match '驳论') { $type = "Rebuttal" }
        $new = "${r}_${type}_${t}.md"
        $old = $_.FullName
        $newPath = Join-Path $base $new
        if (-not (Test-Path $newPath)) {
            Write-Host "git mv `"$($_.Name)`" `"$new`""
        }
    }
}
