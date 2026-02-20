# Vercel Deployment Checker
# Run this script to verify your setup before deploying

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Solar Energy Forecasting - Vercel Deployment Check" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Check 1: Model files exist
Write-Host "[1/7] Checking model files..." -ForegroundColor Yellow
if (Test-Path "backend/models/fi_adaboost.pkl") {
    $size = (Get-Item "backend/models/fi_adaboost.pkl").Length / 1MB
    $sizeStr = [math]::Round($size, 2)
    Write-Host "  [OK] fi_adaboost.pkl found ($sizeStr MB)" -ForegroundColor Green
    if ($size -gt 100) {
        Write-Host "  [WARNING] Model is large. May hit Vercel size limits." -ForegroundColor Yellow
    }
} else {
    Write-Host "  [ERROR] fi_adaboost.pkl not found!" -ForegroundColor Red
    $allGood = $false
}

# Check 2: API directory exists
Write-Host "[2/7] Checking API directory..." -ForegroundColor Yellow
if (Test-Path "api/predict.py") {
    Write-Host "  [OK] api/predict.py found" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] api/predict.py not found!" -ForegroundColor Red
    $allGood = $false
}

# Check 3: vercel.json exists
Write-Host "[3/7] Checking vercel.json..." -ForegroundColor Yellow
if (Test-Path "vercel.json") {
    Write-Host "  [OK] vercel.json found" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] vercel.json not found!" -ForegroundColor Red
    $allGood = $false
}

# Check 4: Frontend built
Write-Host "[4/7] Checking if frontend can build..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    Write-Host "  [OK] package.json found" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] package.json not found!" -ForegroundColor Red
    $allGood = $false
}

# Check 5: Python dependencies
Write-Host "[5/7] Checking Python dependencies..." -ForegroundColor Yellow
if (Test-Path "api/requirements.txt") {
    Write-Host "  [OK] api/requirements.txt found" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] api/requirements.txt not found!" -ForegroundColor Red
    $allGood = $false
}

# Check 6: Backend predictor
Write-Host "[6/7] Checking backend predictor..." -ForegroundColor Yellow
if (Test-Path "backend/predictor.py") {
    Write-Host "  [OK] backend/predictor.py found" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] backend/predictor.py not found!" -ForegroundColor Red
    $allGood = $false
}

# Check 7: ForecastingTool has correct API calls
Write-Host "[7/7] Checking frontend API configuration..." -ForegroundColor Yellow
$forecastingTool = Get-Content "src/components/ForecastingTool.tsx" -Raw
if ($forecastingTool -match "import\.meta\.env\.DEV") {
    Write-Host "  [OK] Frontend has environment-aware API calls" -ForegroundColor Green
} else {
    Write-Host "  [WARNING] Frontend may have hardcoded localhost URLs" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan

if ($allGood) {
    Write-Host "[SUCCESS] All checks passed! Ready to deploy to Vercel." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Commit all changes: git add . && git commit -m 'Ready for Vercel'" -ForegroundColor White
    Write-Host "  2. Deploy: vercel" -ForegroundColor White
    Write-Host "  or" -ForegroundColor White
    Write-Host "  2. Push to GitHub and deploy via Vercel Dashboard" -ForegroundColor White
} else {
    Write-Host "[FAILED] Some checks failed. Please fix the issues above." -ForegroundColor Red
}

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
