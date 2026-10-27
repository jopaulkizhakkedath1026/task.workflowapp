# FlowTask HTTP & REST API Server (PowerShell Native)
# Runs without external dependencies on any Windows machine

$PORT = 5000
$PREFIX = "http://localhost:$PORT/"
$DIR = $PSScriptRoot
$DB_FILE = Join-Path $DIR "tasks-db.json"
$HTML_FILE = Join-Path $DIR "preview.html"

# Default Tasks Database Seeder
if (-not (Test-Path $DB_FILE)) {
  $defaultTasks = @(
    @{
      id = "1"
      title = "Define Project MVP & User Stories"
      description = "Document acceptance criteria, roles, wireframes, and API contracts in README."
      status = "done"
      priority = "high"
      dueDate = "2023-05-10"
      createdAt = (Get-Date).ToString("o")
    },
    @{
      id = "2"
      title = "Setup MongoDB Atlas & Mongoose Schemas"
      description = "Configure User and Task models with strict field validation and indexes."
      status = "done"
      priority = "urgent"
      dueDate = "2023-05-12"
      createdAt = (Get-Date).ToString("o")
    },
    @{
      id = "3"
      title = "Implement JWT Auth & Ownership Verification"
      description = "Ensure registered users can only see, edit, and delete their own workflow tasks."
      status = "in_progress"
      priority = "high"
      dueDate = "2023-05-18"
      createdAt = (Get-Date).ToString("o")
    },
    @{
      id = "4"
      title = "Build Controlled Task Modal Form"
      description = "Implement four UI states: Loading, Success, Empty, and Error banners."
      status = "review"
      priority = "medium"
      dueDate = "2023-05-20"
      createdAt = (Get-Date).ToString("o")
    },
    @{
      id = "5"
      title = "Automated End-to-End API Testing"
      description = "Test all endpoints in Postman / Thunder Client with valid and edge case inputs."
      status = "todo"
      priority = "medium"
      dueDate = "2023-05-24"
      createdAt = (Get-Date).ToString("o")
    }
  )
  $defaultTasks | ConvertTo-Json -Depth 5 | Set-Content -Path $DB_FILE -Encoding UTF8
}

function Get-DBTasks {
  if (Test-Path $DB_FILE) {
    try {
      $json = Get-Content -Path $DB_FILE -Raw -Encoding UTF8
      return ($json | ConvertFrom-Json)
    } catch {
      return @()
    }
  }
  return @()
}

function Save-DBTasks($tasks) {
  $tasks | ConvertTo-Json -Depth 5 | Set-Content -Path $DB_FILE -Encoding UTF8
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($PREFIX)

try {
  $listener.Start()
  Write-Host "==========================================================" -ForegroundColor Cyan
  Write-Host "  FlowTask Local Server Started Successfully!" -ForegroundColor Green
  Write-Host "  URL: $PREFIX" -ForegroundColor Yellow
  Write-Host "  API Base: $PREFIX`api/tasks" -ForegroundColor Cyan
  Write-Host "  Press Ctrl+C to terminate the server" -ForegroundColor Gray
  Write-Host "==========================================================" -ForegroundColor Cyan

  # Open Default Browser
  Start-Process $PREFIX

  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    # Common CORS headers
    $response.Headers.Add("Access-Control-Allow-Origin", "*")
    $response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    $response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization")

    $path = $request.Url.AbsolutePath
    $method = $request.HttpMethod

    Write-Host "[$((Get-Date).ToString('HH:mm:ss'))] $method $path" -ForegroundColor DarkCyan

    if ($method -eq "OPTIONS") {
      $response.StatusCode = 200
      $response.Close()
      continue
    }

    # API Routes
    if ($path.StartsWith("/api/")) {
      $response.ContentType = "application/json; charset=utf-8"

      if ($path -eq "/api/health") {
        $resObj = @{ status = "healthy"; timestamp = (Get-Date).ToString("o"); port = $PORT }
        $bytes = [System.Text.Encoding]::UTF8.GetBytes(($resObj | ConvertTo-Json))
        $response.StatusCode = 200
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
        $response.Close()
        continue
      }

      if ($path -eq "/api/auth/login" -or $path -eq "/api/auth/register") {
        $reader = New-Object System.IO.StreamReader($request.InputStream, [System.Text.Encoding]::UTF8)
        $body = $reader.ReadToEnd()
        $resObj = @{
          success = $true
          token = "mock_jwt_token_" + [System.Guid]::NewGuid().ToString()
          user = @{
            _id = "646399f24da030a273b092a1"
            name = "Jopaul Kizhakkedath"
            email = "jopaul@example.com"
            role = "user"
          }
        }
        $bytes = [System.Text.Encoding]::UTF8.GetBytes(($resObj | ConvertTo-Json))
        $response.StatusCode = 200
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
        $response.Close()
        continue
      }

      if ($path -eq "/api/auth/me") {
        $resObj = @{
          success = $true
          user = @{
            _id = "646399f24da030a273b092a1"
            name = "Jopaul Kizhakkedath"
            email = "jopaul@example.com"
            role = "user"
          }
        }
        $bytes = [System.Text.Encoding]::UTF8.GetBytes(($resObj | ConvertTo-Json))
        $response.StatusCode = 200
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
        $response.Close()
        continue
      }

      if ($path -eq "/api/tasks/stats") {
        $tasks = @(Get-DBTasks)
        $stats = @{
          todo = ($tasks | Where-Object { $_.status -eq "todo" }).Count
          in_progress = ($tasks | Where-Object { $_.status -eq "in_progress" }).Count
          review = ($tasks | Where-Object { $_.status -eq "review" }).Count
          done = ($tasks | Where-Object { $_.status -eq "done" }).Count
          total = $tasks.Count
        }
        $resObj = @{ success = $true; stats = $stats }
        $bytes = [System.Text.Encoding]::UTF8.GetBytes(($resObj | ConvertTo-Json))
        $response.StatusCode = 200
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
        $response.Close()
        continue
      }

      if ($path -eq "/api/tasks" -and $method -eq "GET") {
        $tasks = @(Get-DBTasks)
        $resObj = @{
          success = $true
          count = $tasks.Count
          total = $tasks.Count
          tasks = $tasks
        }
        $bytes = [System.Text.Encoding]::UTF8.GetBytes(($resObj | ConvertTo-Json -Depth 5))
        $response.StatusCode = 200
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
        $response.Close()
        continue
      }

      if ($path -eq "/api/tasks" -and $method -eq "POST") {
        $reader = New-Object System.IO.StreamReader($request.InputStream, [System.Text.Encoding]::UTF8)
        $body = $reader.ReadToEnd()
        $payload = $body | ConvertFrom-Json
        
        $newTask = @{
          id = [System.Guid]::NewGuid().ToString()
          title = if ($payload.title) { $payload.title } else { "Untitled Task" }
          description = if ($payload.description) { $payload.description } else { "" }
          status = if ($payload.status) { $payload.status } else { "todo" }
          priority = if ($payload.priority) { $payload.priority } else { "medium" }
          dueDate = if ($payload.dueDate) { $payload.dueDate } else { "" }
          createdAt = (Get-Date).ToString("o")
        }

        $tasks = @(Get-DBTasks)
        $tasks = @($newTask) + $tasks
        Save-DBTasks $tasks

        $resObj = @{ success = $true; message = "Task created"; task = $newTask }
        $bytes = [System.Text.Encoding]::UTF8.GetBytes(($resObj | ConvertTo-Json))
        $response.StatusCode = 201
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
        $response.Close()
        continue
      }

      if ($path -match "^/api/tasks/(.+)$") {
        $taskId = $matches[1]

        if ($method -eq "GET") {
          $tasks = @(Get-DBTasks)
          $found = $tasks | Where-Object { $_.id -eq $taskId } | Select-Object -First 1
          if ($found) {
            $resObj = @{ success = $true; task = $found }
            $bytes = [System.Text.Encoding]::UTF8.GetBytes(($resObj | ConvertTo-Json))
            $response.StatusCode = 200
          } else {
            $resObj = @{ success = $false; message = "Task not found" }
            $bytes = [System.Text.Encoding]::UTF8.GetBytes(($resObj | ConvertTo-Json))
            $response.StatusCode = 404
          }
          $response.OutputStream.Write($bytes, 0, $bytes.Length)
          $response.Close()
          continue
        }

        if ($method -eq "PUT") {
          $reader = New-Object System.IO.StreamReader($request.InputStream, [System.Text.Encoding]::UTF8)
          $body = $reader.ReadToEnd()
          $payload = $body | ConvertFrom-Json
          $tasks = @(Get-DBTasks)
          $updatedTask = $null

          for ($i = 0; $i -lt $tasks.Count; $i++) {
            if ($tasks[$i].id -eq $taskId) {
              if ($payload.title) { $tasks[$i].title = $payload.title }
              if ($payload.description -ne $null) { $tasks[$i].description = $payload.description }
              if ($payload.status) { $tasks[$i].status = $payload.status }
              if ($payload.priority) { $tasks[$i].priority = $payload.priority }
              if ($payload.dueDate -ne $null) { $tasks[$i].dueDate = $payload.dueDate }
              $updatedTask = $tasks[$i]
              break
            }
          }

          if ($updatedTask) {
            Save-DBTasks $tasks
            $resObj = @{ success = $true; message = "Task updated"; task = $updatedTask }
            $response.StatusCode = 200
          } else {
            $resObj = @{ success = $false; message = "Task not found" }
            $response.StatusCode = 404
          }
          $bytes = [System.Text.Encoding]::UTF8.GetBytes(($resObj | ConvertTo-Json))
          $response.OutputStream.Write($bytes, 0, $bytes.Length)
          $response.Close()
          continue
        }

        if ($method -eq "DELETE") {
          $tasks = @(Get-DBTasks)
          $newTasks = @($tasks | Where-Object { $_.id -ne $taskId })
          Save-DBTasks $newTasks
          $resObj = @{ success = $true; message = "Task deleted"; id = $taskId }
          $bytes = [System.Text.Encoding]::UTF8.GetBytes(($resObj | ConvertTo-Json))
          $response.StatusCode = 200
          $response.OutputStream.Write($bytes, 0, $bytes.Length)
          $response.Close()
          continue
        }
      }
    }

    # Static Web App Delivery
    if (Test-Path $HTML_FILE) {
      $htmlBytes = [System.IO.File]::ReadAllBytes($HTML_FILE)
      $response.ContentType = "text/html; charset=utf-8"
      $response.StatusCode = 200
      $response.OutputStream.Write($htmlBytes, 0, $htmlBytes.Length)
      $response.Close()
    } else {
      $response.StatusCode = 404
      $response.Close()
    }
  }
} finally {
  $listener.Stop()
  $listener.Close()
}
