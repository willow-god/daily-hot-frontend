$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

Add-Type -AssemblyName System.Drawing

$sourceDir = "D:\Windows\Download\Browsers"
$targetDir = Join-Path $PSScriptRoot "..\public\logo"

$map = @{
  "sina-news" = "length:10010"
  "csdn" = "length:7086"
  "smzdm" = "length:12065"
  "hupu" = "length:10237"
  "sina" = "length:7683"
  "52pojie" = "length:11210"
  "linuxdo" = "length:7543"
  "nodeseek" = "length:3679"
  "51cto" = "length:4403"
  "hackernews" = "length:3552"
  "ithome-xijiayi" = "length:3148"
  "miyoushe" = "length:19233"
  "yystv" = "length:5870"
  "huxiu" = "length:4912"
  "ifanr" = "length:4805"
  "geekpark" = "length:3566"
  "dgtle" = "length:4889"
  "guokr" = "length:7134"
  "newsmth" = "length:6311"
  "history" = "length:8216"
  "weatheralarm" = "length:6433"
  "nytimes" = "length:7328"
}

if (!(Test-Path -LiteralPath $targetDir)) {
  New-Item -ItemType Directory -Path $targetDir | Out-Null
}

foreach ($entry in $map.GetEnumerator()) {
  $targetName = $entry.Key
  $sourceName = $entry.Value
  if ($sourceName.StartsWith("length:")) {
    $expectedLength = [int64]$sourceName.Substring("length:".Length)
    $sourceMatch = Get-ChildItem -LiteralPath $sourceDir -File | Where-Object { $_.Length -eq $expectedLength } | Select-Object -First 1
    if (!$sourceMatch) {
      throw "Missing source icon: $sourceName"
    }
    $sourcePath = $sourceMatch.FullName
  } elseif ($sourceName.Contains("*")) {
    $sourceMatch = Get-ChildItem -LiteralPath $sourceDir -File | Where-Object { $_.Name -like $sourceName } | Select-Object -First 1
    if (!$sourceMatch) {
      throw "Missing source icon: $sourceName"
    }
    $sourcePath = $sourceMatch.FullName
  } else {
    $sourcePath = Join-Path $sourceDir $sourceName
  }
  $targetPath = Join-Path $targetDir "$targetName.png"

  if (!(Test-Path -LiteralPath $sourcePath)) {
    throw "Missing source icon: $sourceName"
  }

  $sourceImage = [System.Drawing.Image]::FromFile((Resolve-Path -LiteralPath $sourcePath).Path)
  try {
    $canvas = New-Object System.Drawing.Bitmap 256, 256
    try {
      $graphics = [System.Drawing.Graphics]::FromImage($canvas)
      try {
        $graphics.Clear([System.Drawing.Color]::Transparent)
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

        $ratio = [Math]::Min(256.0 / $sourceImage.Width, 256.0 / $sourceImage.Height)
        $drawWidth = [Math]::Round($sourceImage.Width * $ratio)
        $drawHeight = [Math]::Round($sourceImage.Height * $ratio)
        $offsetX = [Math]::Floor((256 - $drawWidth) / 2)
        $offsetY = [Math]::Floor((256 - $drawHeight) / 2)

        $graphics.DrawImage($sourceImage, $offsetX, $offsetY, $drawWidth, $drawHeight)
      } finally {
        $graphics.Dispose()
      }

      $canvas.Save($targetPath, [System.Drawing.Imaging.ImageFormat]::Png)
    } finally {
      $canvas.Dispose()
    }
  } finally {
    $sourceImage.Dispose()
  }
}

"logo assets generated"
