$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$outputPath = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\images\social-preview.png'))
$bitmap = [System.Drawing.Bitmap]::new(1200, 630)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

$background = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
    [System.Drawing.Rectangle]::new(0, 0, 1200, 630),
    [System.Drawing.Color]::FromArgb(7, 17, 22),
    [System.Drawing.Color]::FromArgb(12, 62, 72),
    16.0
)
$graphics.FillRectangle($background, 0, 0, 1200, 630)

$stars = @(
    @(795, 107), @(980, 85), @(1096, 155), @(874, 219), @(1042, 277),
    @(754, 326), @(893, 405), @(1078, 461), @(949, 546), @(1170, 363),
    @(825, 509), @(719, 170)
)
$line = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(90, 120, 232, 239), 2)
$starBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(200, 179, 243, 242))
for ($index = 0; $index -lt 9; $index++) {
    $graphics.DrawLine($line, [int]$stars[$index][0], [int]$stars[$index][1], [int]$stars[$index + 1][0], [int]$stars[$index + 1][1])
}
$graphics.DrawLine($line, 754, 326, 874, 219)
$graphics.DrawLine($line, 754, 326, 893, 405)
$graphics.DrawLine($line, 893, 405, 1042, 277)
foreach ($star in $stars) {
    $graphics.FillEllipse($starBrush, [int]$star[0] - 3, [int]$star[1] - 3, 6, 6)
}

$accent = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(120, 232, 239))
$white = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(243, 251, 250))
$soft = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(197, 223, 224))
$label = [System.Drawing.Font]::new('Arial', 28, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$headline = [System.Drawing.Font]::new('Arial', 70, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$subtitle = [System.Drawing.Font]::new('Arial', 26, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$footer = [System.Drawing.Font]::new('Arial', 18, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)

$graphics.DrawString('LOCKDOWN STUDIOS', $label, $white, 72, 91)
$graphics.FillRectangle($accent, 72, 160, 78, 3)
$graphics.DrawString('Make it clear.', $headline, $white, 72, 235)
$graphics.DrawString('Make it count.', $headline, $accent, 72, 318)
$graphics.DrawString('Websites  ·  Apps  ·  Games  ·  3D  ·  AI', $subtitle, $soft, 74, 453)
$graphics.DrawString('JOHANNESBURG / CREATIVE TECHNOLOGY STUDIO', $footer, $accent, 74, 545)

$bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$footer.Dispose(); $subtitle.Dispose(); $headline.Dispose(); $label.Dispose()
$soft.Dispose(); $white.Dispose(); $accent.Dispose(); $starBrush.Dispose(); $line.Dispose()
$background.Dispose(); $graphics.Dispose(); $bitmap.Dispose()
Write-Output $outputPath
