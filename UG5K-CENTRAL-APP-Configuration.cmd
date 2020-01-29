:menu
cls
@echo off
echo *********************************************************************
echo **** Utilidad de Configuracion de la Aplicacion Centralizada de  ****
echo **** Configuracion para REDAN V5                                 ****
echo *********************************************************************
echo.
echo.
choice /C SN /M "Crear el servicio Ulises G5000 ? (S)i (N)o" 
if errorlevel 2 goto basedatos
if errorlevel 1 goto instala-servicio
goto menu
:instala-servicio
reg Query "HKLM\Hardware\Description\System\CentralProcessor\0" | find /i "x86" > NUL && set OS=32BIT || set OS=64BIT
if %OS%==32BIT echo This is a 32bit operating system
if %OS%==64BIT echo This is a 64bit operating system
if %OS%==32BIT copy .\nss\win32\nssm.exe .
if %OS%==64BIT copy .\nss\win64\nssm.exe .
.\nssm.exe install Ulises-G5000

:basedatos
echo.
choice /C NS /M "Crear la Base de datos? (Se perderían los datos existentes) (N)o (S)i" 
if errorlevel 1 goto incidencias
if errorlevel 2 goto instala-bdt
goto basedatos
:instala-bdt
@echo "Actualizando Esquema de Base de Datos..."
mysql.exe --host=localhost --user=root --password="U5K-G"  <  .\data_model\ug5kv2-schema.sql
@echo "Esquema de Base de Datos creado."

:incidencias
echo.
choice /C NS /M "Actualizar la Tabla de Incidencias? (N)o (S)i" 
if errorlevel 1 goto fin
if errorlevel 2 goto instala-inci
goto incidencias
:instala-inci
@echo "Actualizando tablas de incidencias..."
mysql.exe --host=localhost --user=root --password="U5K-G"  <  .\data_model\ug5kv2-incitb.sql
@echo "Actualizacion de las tablas de incidencias finalizada."

:fin
@echo Fin de la instalacion
pause
