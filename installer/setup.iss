[Setup]
AppName=EssentialAPP
AppVersion=1.0.0
DefaultDirName={pf}\EssentialAPP
DefaultGroupName=EssentialAPP

[Tasks]
Name: "desktopicon"; Description: "Create a Desktop Shortcut"; GroupDescription: "Additional icons"
Name: "quicklaunchicon"; Description: "Pin to Start Menu"; GroupDescription: "Additional icons"
Name: "taskbaricon"; Description: "Pin to Taskbar"; GroupDescription: "Additional icons"

[Icons]
Name: "{userdesktop}\EssentialAPP"; Filename: "{app}\EssentialAPP.exe"; Tasks: desktopicon
Name: "{userappdata}\Microsoft\Internet Explorer\Quick Launch\EssentialAPP"; Filename: "{app}\EssentialAPP.exe"; Tasks: quicklaunchicon
Name: "{userappdata}\Microsoft\Windows\Start Menu\Programs\EssentialAPP"; Filename: "{app}\EssentialAPP.exe"; Tasks: taskbaricon