# Test Supabase Photo Upload API
$imagePath = "public\placeholder-user.jpg"
$uri = "http://localhost:3000/api/upload/photo"

Write-Host "Testing photo upload to Supabase storage..."
Write-Host "Image: $imagePath"
Write-Host "API Endpoint: $uri"
Write-Host ""

try {
    # Create multipart form data
    $boundary = [System.Guid]::NewGuid().ToString()
    $LF = "`r`n"
    
    # Read the image file
    $imageBytes = [System.IO.File]::ReadAllBytes($imagePath)
    
    # Create form data
    $bodyLines = (
        "--$boundary",
        "Content-Disposition: form-data; name=`"userId`"",
        "",
        "test-user-123",
        "--$boundary",
        "Content-Disposition: form-data; name=`"photo`"; filename=`"test-image.jpg`"",
        "Content-Type: image/jpeg",
        ""
    ) -join $LF
    
    $bodyEnd = $LF + "--$boundary--" + $LF
    
    # Convert to bytes
    $bodyLinesBytes = [System.Text.Encoding]::UTF8.GetBytes($bodyLines + $LF)
    $bodyEndBytes = [System.Text.Encoding]::UTF8.GetBytes($bodyEnd)
    
    # Combine all bytes
    $body = $bodyLinesBytes + $imageBytes + $bodyEndBytes
    
    # Make the request
    $response = Invoke-RestMethod -Uri $uri -Method Post -Body $body -ContentType "multipart/form-data; boundary=$boundary"
    
    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 3
    
    if ($response.success) {
        Write-Host ""
        Write-Host "Upload Details:" -ForegroundColor Cyan
        Write-Host "  URL: $($response.data.url)"
        Write-Host "  Path: $($response.data.path)"
        Write-Host "  Size: $([math]::Round($response.data.fileSize / 1024 / 1024, 2)) MB"
        Write-Host "  Type: $($response.data.fileType)"
    }
    
} catch {
    Write-Host "ERROR!" -ForegroundColor Red
    Write-Host "Error Message: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Test completed." -ForegroundColor Gray