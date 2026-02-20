# Test Backend API Script
# Run this to test if your Railway backend is working

$BACKEND_URL = "https://solarenergypotentialforecastingprototype-production.up.railway.app/"  # e.g.,https://solarenergypotentialforecastingprototype-production.up.railway.app/

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Solar Energy API Backend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Root endpoint
Write-Host "[1/4] Testing root endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BACKEND_URL/" -Method Get
    Write-Host "  [OK] Root endpoint working" -ForegroundColor Green
    Write-Host "  Status: $($response.status)" -ForegroundColor White
} catch {
    Write-Host "  [ERROR] Failed to reach root endpoint" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Health check
Write-Host "[2/4] Testing health check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BACKEND_URL/health" -Method Get
    Write-Host "  [OK] Health check passed" -ForegroundColor Green
    Write-Host "  Status: $($response.status)" -ForegroundColor White
    Write-Host "  Model loaded: $($response.model_loaded)" -ForegroundColor White
} catch {
    Write-Host "  [ERROR] Health check failed" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Model info
Write-Host "[3/4] Testing model info..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BACKEND_URL/info" -Method Get
    Write-Host "  [OK] Model info retrieved" -ForegroundColor Green
    Write-Host "  Model: $($response.model)" -ForegroundColor White
    Write-Host "  Version: $($response.version)" -ForegroundColor White
} catch {
    Write-Host "  [ERROR] Model info failed" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: Prediction
Write-Host "[4/4] Testing prediction endpoint..." -ForegroundColor Yellow
try {
    $body = @{
        lat = 7.0731
        lng = 125.6128
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$BACKEND_URL/predict" -Method Post -Body $body -ContentType "application/json"
    Write-Host "  [OK] Prediction successful" -ForegroundColor Green
    Write-Host "  Solar Potential: $($response.solarPotential) kWh/m²/day" -ForegroundColor White
    Write-Host "  Rooftop Area: $($response.rooftopArea) m²" -ForegroundColor White
} catch {
    Write-Host "  [ERROR] Prediction failed" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
