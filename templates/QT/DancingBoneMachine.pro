# Qmake and QT Config
CONFIG += qt debug threaded
QT += core widgets webkit webkitwidgets
TEMPLATE = app

# Compiler flags: Optimize harder.
QMAKE_CXXFLAGS += -O3

# Input
HEADERS += src/*.h
SOURCES += src/*.cpp
# SOURCES += HoaLibrary/PureData/hoaMap/hoa.map~.cpp

# Output
DESTDIR = bin
TARGET = DancingBoneMachine
OBJECTS_DIR += obj
RCC_DIR += obj
MOC_DIR += obj


# Copy resources
macx{
	RESOURCES_DIR = $$DESTDIR/DancingBoneMachine.app/Contents/MacOS
}
res.commands = mkdir -p $$RESOURCES_DIR/res/vendors \
	&& rsync -avuL app/html/ $$RESOURCES_DIR/res/html \
	&& rsync -avuL app/pd/ $$RESOURCES_DIR/res/pd && rm $$RESOURCES_DIR/res/pd/dbm/dbm-connect.pd \
	&& mkdir -p $$RESOURCES_DIR/res/vendors/hoa/HoaLibrary/PureData/builds \
	&& rsync -avuL app/vendors/hoa/HoaLibrary/PureData/builds/ $$RESOURCES_DIR/res/vendors/hoa/HoaLibrary/PureData/builds
res.target = $$RESOURCES_DIR/res
res.CONFIG = phony
QMAKE_EXTRA_TARGETS += res
POST_TARGETDEPS += $$RESOURCES_DIR/res
QMAKE_CLEAN += -r $$RESOURCES_DIR/res

# Run
run.target = run
macx{
	run.commands = bin/DancingBoneMachine.app/Contents/MacOS/DancingBoneMachine
}
run.depends = $(TARGET)
QMAKE_EXTRA_TARGETS += run

# RTAudio Library
rtaudio_dir = "vendors/rtaudio"
rtaudio_lib = "vendors/rtaudio/librtaudio.a"
rtaudio.target = $$rtaudio_lib
macx{
   DEFINES += __MACOSX_CORE__ 
   rtaudio.commands = cd $$rtaudio_dir && ./configure --with-core && make
}
QMAKE_EXTRA_TARGETS += rtaudio
PRE_TARGETDEPS += $$rtaudio_lib
INCLUDEPATH += $$rtaudio_dir
LIBS += $$rtaudio_lib
LIBS += -framework CoreFoundation
LIBS += -framework CoreAudio
LIBS += -framework Accelerate

# LibPD Library
libpd_dir = "vendors/libpd"
libpd_lib = "vendors/libpd/build/Release/libpd-osx.a"
libpd.target = $$libpd_lib
macx{
   libpd.commands = cd $$libpd_dir && xcodebuild -project libpd.xcodeproj -target libpd-osx -configuration Release
}
QMAKE_EXTRA_TARGETS += libpd
PRE_TARGETDEPS += $$libpd_lib
INCLUDEPATH += $${libpd_dir}/cpp
LIBS += $$libpd_lib

# vim: set ft=make:
