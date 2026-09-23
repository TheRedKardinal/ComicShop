@echo off
setlocal
title ComicShop (IDE)
cd /d "%~dp0"

rem ---------- IntelliJ: cerca l'installazione piu' recente ----------
rem Prima la Community, poi le altre: se c'e' la versione completa vince quella.
set "IDEA="
for /d %%D in ("%ProgramFiles%\JetBrains\IntelliJ IDEA Community*") do (
  if exist "%%D\bin\idea64.exe" set "IDEA=%%D\bin\idea64.exe"
)
for /d %%D in ("%ProgramFiles%\JetBrains\IntelliJ IDEA 2*") do (
  if exist "%%D\bin\idea64.exe" set "IDEA=%%D\bin\idea64.exe"
)

if defined IDEA (
  echo [BE] IntelliJ: "%IDEA%"
  start "" "%IDEA%" "%~dp0be"
) else (
  echo [BE] IntelliJ non trovato in "%ProgramFiles%\JetBrains".
)

rem ---------- VS Code: il comando "code" e' nel PATH ----------
where code >nul 2>&1
if errorlevel 1 (
  echo [FE] VS Code non trovato: manca "code" nel PATH.
) else (
  echo [FE] VS Code: fe
  call code "%~dp0fe"
)

echo.
echo  BE: in IntelliJ avvia DemoApplication (porta 8080)
echo  FE: nel terminale di VS Code  npm run dev  (porta 5173)
endlocal
