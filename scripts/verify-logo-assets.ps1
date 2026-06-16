$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$store = Get-Content -Raw (Join-Path $PSScriptRoot "..\src\store\index.js")
$names = [regex]::Matches($store, 'name:\s*"([^"]+)"') | ForEach-Object {
  $_.Groups[1].Value
}

$missing = @()
$newLogoNames = @(
  "sina-news",
  "csdn",
  "smzdm",
  "hupu",
  "sina",
  "52pojie",
  "linuxdo",
  "nodeseek",
  "51cto",
  "hackernews",
  "ithome-xijiayi",
  "miyoushe",
  "yystv",
  "huxiu",
  "ifanr",
  "geekpark",
  "dgtle",
  "guokr",
  "newsmth",
  "history",
  "weatheralarm",
  "nytimes"
)
$badSize = @()

foreach ($name in $names) {
  $logoPath = Join-Path $PSScriptRoot "..\public\logo\$name.png"
  if (!(Test-Path -LiteralPath $logoPath)) {
    $missing += $name
    continue
  }

  if ($newLogoNames -contains $name) {
    $resolvedLogoPath = (Resolve-Path -LiteralPath $logoPath).Path
    $image = [System.Drawing.Image]::FromFile($resolvedLogoPath)
    try {
      if ($image.Width -ne 256 -or $image.Height -ne 256) {
        $badSize += "$name=$($image.Width)x$($image.Height)"
      }
    } finally {
      $image.Dispose()
    }
  }
}

if ($missing.Count) {
  throw "Missing logo files: $($missing -join ', ')"
}

if ($badSize.Count) {
  throw "Logo files must be 256x256: $($badSize -join ', ')"
}

"logo asset verification passed"
