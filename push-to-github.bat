@echo off
title Push to GitHub - FlowTask
cd /d "%~dp0"

echo ======================================================================
echo   Pushing FlowTask Project to GitHub
echo   Target: https://github.com/jopaulkizhakkedath1026/task-workflow-app.git
echo ======================================================================
echo.
echo Make sure you have created the empty repository on GitHub first:
echo https://github.com/new (Repository name: task-workflow-app)
echo.

git push -u origin main

if %errorlevel% neq 0 (
  echo.
  echo [Notice] If the push failed, please verify that:
  echo   1. The repository 'task-workflow-app' exists under github.com/jopaulkizhakkedath1026
  echo   2. You have authenticated with your GitHub credentials in the browser prompt.
) else (
  echo.
  echo ======================================================================
  echo   SUCCESS: All files successfully uploaded to GitHub!
  echo ======================================================================
)

echo.
pause
