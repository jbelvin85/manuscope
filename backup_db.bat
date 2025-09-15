@echo off

REM Load environment variables from .env file if it exists
for /f "tokens=*" %%i in ('type .env ^| findstr /v /b "#"') do (
    for /f "tokens=1,* delims==" %%a in ("%%i") do (
        set "%%a=%%b"
    )
)

set "DB_USER=%DB_USER%"
if "%DB_USER%"=="" set "DB_USER=postgres"

set "DB_NAME=%DB_NAME%"
if "%DB_NAME%"=="" set "DB_NAME=lamdb"

set "DB_PASSWORD=%DB_PASSWORD%"
if "%DB_PASSWORD%"=="" set "DB_PASSWORD=password"

set "DB_SERVICE_NAME=db"

set "BACKUP_DIR=backups"
for /f "tokens=1-4 delims=/ " %%a in ('date /t') do (
    set "YYYY=%%c"
    set "MM=%%a"
    set "DD=%%b"
)
for /f "tokens=1-3 delims=: " %%a in ('time /t') do (
    set "HH=%%a"
    set "MI=%%b"
    set "SS=%%c"
)
set "TIMESTAMP=%YYYY%%MM%%DD%_%HH%%MI%%SS%"
set "BACKUP_FILE=%BACKUP_DIR%\manuscope_db_backup_plain_%TIMESTAMP%.sql"

echo Creating plain SQL database backup from Docker service...
echo Database: %DB_NAME% (service: %DB_SERVICE_NAME%)
echo User: %DB_USER%
echo Backup file: %BACKUP_FILE%

if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

REM Get the container ID of the db service
for /f "delims=" %%i in ('docker-compose ps -q %DB_SERVICE_NAME%') do set CONTAINER_ID=%%i

REM Execute pg_dump inside the Docker container for plain SQL
docker exec -e PGPASSWORD="%DB_PASSWORD%" -t %CONTAINER_ID% pg_dump -U "%DB_USER%" -d "%DB_NAME%" --no-owner --no-privileges > "%BACKUP_FILE%"

if %errorlevel% equ 0 (
    echo Plain SQL database backup created successfully: %BACKUP_FILE%
) else (
    echo Error: Plain SQL database backup failed.
    echo Ensure Docker Desktop/daemon is running and the '%DB_SERVICE_NAME%' service is up.
    exit /b 1
)
