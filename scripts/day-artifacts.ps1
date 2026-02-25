param(
  [Parameter(Mandatory = $true)]
  [string]$Day
)

$repoRoot = Split-Path -Parent $PSScriptRoot
$artifactDir = Join-Path $repoRoot "artifacts"
$dayPatch = Join-Path $artifactDir ("day-" + $Day + ".patch")
$runPatch = Join-Path $artifactDir ("day-" + $Day + "-run.patch")

New-Item -ItemType Directory -Path $artifactDir -Force | Out-Null

Write-Host "=== Git State ==="
git status --short
git branch --show-current

git add -N .

Write-Host "=== Generating cumulative patch (develop baseline when available) ==="
$cumulative = git diff --binary develop -- . ":(exclude)artifacts" 2>$null
if ($LASTEXITCODE -ne 0) {
  $cumulative = git diff --binary -- . ":(exclude)artifacts"
}
$cumulative | Out-File -FilePath $dayPatch -Encoding utf8

Write-Host "=== Generating incremental patch (HEAD baseline when available) ==="
$incremental = git diff --binary HEAD -- . ":(exclude)artifacts" 2>$null
if ($LASTEXITCODE -ne 0) {
  $incremental = git diff --binary -- . ":(exclude)artifacts"
}
$incremental | Out-File -FilePath $runPatch -Encoding utf8

Write-Host "=== Artifact Metadata ==="
Get-Item $dayPatch, $runPatch | Format-List Name,Length,LastWriteTime
