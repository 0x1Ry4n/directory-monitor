import PyInstaller.__main__ 

PyInstaller.__main__.run([
    'app.py', 
    '--add-data=assets;assets/',
    '--noconfirm', 
])
