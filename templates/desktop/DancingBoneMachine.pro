## App name
TARGET = DancingBoneMachine

## Additional sources
# HEADERS += something.h
# SOURCES += something.cpp

# There should be no need of modifying anything below this line
###############################################################################


# Qmake and QT Config
CONFIG += qt threaded
QT += core widgets webkit webkitwidgets
TEMPLATE = app

# If debug compile
CONFIG(debug, debug|release){
   # Output messages to console 
   CONFIG += console
} else{
   # Optimize
   QMAKE_CXXFLAGS += -O3
}

# Compiler flagss
QMAKE_CXXFLAGS += -Wall

# Input
HEADERS += src/*.h
SOURCES += src/*.cpp

# Output
DESTDIR = bin
OBJECTS_DIR += obj
RCC_DIR += obj
MOC_DIR += obj

# Copy resource files
macx{	
   RESOURCES_DIR = $$DESTDIR/DancingBoneMachine.app/Contents/MacOS
}
win32{
   RESOURCES_DIR = $$DESTDIR
}
res.commands = mkdir -p $$RESOURCES_DIR/res \
	&& rsync -avuL --del app/html/ $$RESOURCES_DIR/res/html \
	&& rsync -avuL --exclude=dbm-connect.pd  app/pd/ $$RESOURCES_DIR/res/pd
res.target = $$RESOURCES_DIR/res
res.CONFIG = phony
QMAKE_EXTRA_TARGETS += res
POST_TARGETDEPS += $$RESOURCES_DIR/res
MAKE_DISTCLEAN += -r $$DESTDIR/*

# Deploy (create distributable binary)
deploy.target = deploy
macx{
   QT_BIN_DIR = ~/Qt/5.2.1/clang_64/bin
	deploy.commands = make distclean && qmake && make release && \
      $$QT_BIN_DIR/macdeployqt bin/DancingBoneMachine.app -dmg
}
win32{
   QT_BIN_DIR = /c/Qt/Qt5.2.1/5.2.1/mingw48_32/bin
   deploy.commands = make distclean && \
      make release && \
      $$QT_BIN_DIR/windeployqt bin/DancingBoneMachine.exe && \
      rsync -avu $$QT_BIN_DIR/libgcc_s_dw2-1.dll $$DESTDIR && \
      rsync -avu $$QT_BIN_DIR/libstdc++-6.dll $$DESTDIR && \
      rsync -avu $$QT_BIN_DIR/libwinpthread-1.dll $$DESTDIR
}
deploy.depends = $(TARGET)
QMAKE_EXTRA_TARGETS += deploy

# Run
run.target = run
macx{
	run.commands = bin/DancingBoneMachine.app/Contents/MacOS/DancingBoneMachine
}
win32{
   run.commands = bin/DancingBoneMachine.exe
}
run.depends = $(TARGET)
QMAKE_EXTRA_TARGETS += run

# RTAudio Library
rtaudio_dir = "vendors/rtaudio"
rtaudio_lib = "vendors/rtaudio/librtaudio.a"
rtaudio.target = $$rtaudio_lib
INCLUDEPATH += $$rtaudio_dir
QMAKE_EXTRA_TARGETS += rtaudio
PRE_TARGETDEPS += $$rtaudio_lib
LIBS += $$rtaudio_lib
macx{
   DEFINES += __MACOSX_CORE__ 
   rtaudio.commands = cd $$rtaudio_dir && autoconf && ./configure --with-core && make
   LIBS += -framework CoreFoundation
   LIBS += -framework CoreAudio
   LIBS += -framework Accelerate
}
win32{
   DEFINES += __WINDOWS_DS__ 
   rtaudio.commands = cd $$rtaudio_dir && ./configure --with-ds && make
}

# LibPD Library
libpd_dir = "vendors/libpd"
macx{
   libpd_lib = $$libpd_dir/build/Release/libpd-osx.a
   libpd.commands = cd $$libpd_dir && xcodebuild -project libpd.xcodeproj -target libpd-osx -configuration Release
}
win32{
   libpd_lib = $$libpd_dir/libs/libpdcpp.a
   libpd.commands = cd $$libpd_dir && make cpplib
 }
libpd.target = $$libpd_lib
QMAKE_EXTRA_TARGETS += libpd
PRE_TARGETDEPS += $$libpd_lib
INCLUDEPATH += $${libpd_dir}/cpp
INCLUDEPATH += $${libpd_dir}/pure-data/src
LIBS += $$libpd_lib

# system libraries for windows
win32{
   LIBS += -lstdc++ 
   LIBS += -lgcc
   LIBS += -lpthread
   LIBS += -ldsound
   LIBS += -lwinmm
   LIBS += -lole32
   LIBS += -lws2_32
}

# vim: set ft=make:
