@echo off
echo ========================================
echo GitHub Pages Deployment Script
echo ========================================
echo.

echo Step 1: Navigate to project folder
cd /d C:\Users\Suprakash\inventory-entry-page
echo Current directory: %CD%
echo.

echo Step 2: Initialize Git repository (if not already done)
if not exist .git (
    git init
    echo Git repository initialized
) else (
    echo Git repository already exists
)
echo.

echo Step 3: Add all files
git add .
echo Files added to staging
echo.

echo Step 4: Commit changes
git commit -m "Update - Inventory Entry System"
echo Changes committed
echo.

echo Step 5: Push to GitHub
echo NOTE: You will need to enter your GitHub credentials
echo Username: Your GitHub username
echo Password: Your GitHub Personal Access Token (NOT your account password)
echo.
git push -u origin main

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Your site will be available at:
echo https://YOUR_USERNAME.github.io/inventory-entry-system/
echo.
echo IMPORTANT: Replace YOUR_USERNAME with your actual GitHub username
echo.
pause
