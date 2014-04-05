#Windows

0. Install Git 1.9.0 from
	http://git-scm.com/download/win

1. Install QT 5.2.1 with MinGW 32bit from 
	http://qt-project.org/downloads
	http://download.qt-project.org/official_releases/qt/5.2/5.2.1/qt-opensource-windows-x86-msvc2010-5.2.1.exe

2. Install MinGW-get-setup 0.6.2 from
	http://sourceforge.net/projects/mingw/files/Installer/mingw-get-setup.exe/download

3. Using mingw-get, install gcc, msys (and other stuff I can't remember).

4. Create a shortcut to C:\MinGW\msys\1.0\msys.bat somewhere, that's what you'll use to launch the MinGW terminal.

5. Create a file in /c/MinGW/mysys/home/<username>/.profile with:
	export PATH=/c/Qt/Qt5.2.1/5.2.1/mingw48_32/bin:/c/Qt/Qt5.2.1/Tools/mingw48_32/bin:$PATH

6. Now you can cd into the qt wrapper app and do qmake && make

#MacOS

...
