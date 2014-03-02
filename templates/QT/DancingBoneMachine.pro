# Qmake and QT Config
CONFIG += qt debug threaded
QT += core widgets webkit webkitwidgets
TEMPLATE = app

# Compiler flags: Optimize harder.
QMAKE_CXXFLAGS += -O3

# Input
HEADERS += src/*.h
SOURCES += src/*.cpp

# Output
DESTDIR = bin
TARGET = DancingBoneMachine
OBJECTS_DIR += obj
RCC_DIR += obj
MOC_DIR += obj


macx{
	RESOURCES_DIR = $$DESTDIR/DancingBoneMachine.app/Contents/MacOS
}

# Copy pd objects to binary bundle
macx{
	copy_pd.target = $$RESOURCES_DIR/res/pd/dbm
	copy_pd.commands = cp -RL ../../library/dancing-bone-machine/pd/externals/bin $$RESOURCES_DIR/res/pd/dbm
}
QMAKE_EXTRA_TARGETS += copy_pd
POST_TARGETDEPS += $$RESOURCES_DIR/res/pd/dbm

# Copy resources to binary bundle
macx{
	copy_resources.target = $$RESOURCES_DIR/res
	copy_resources.commands = cp -RL res $$RESOURCES_DIR
}
QMAKE_EXTRA_TARGETS += copy_resources
POST_TARGETDEPS += $$RESOURCES_DIR/res


# Run
run.target = run
macx{
	run.commands = bin/DancingBoneMachine.app/Contents/MacOS/DancingBoneMachine
}
run.depends = $(TARGET)
QMAKE_EXTRA_TARGETS += run

# RTAudio Library
rtaudio_dir = "rtaudio"
rtaudio_lib = "rtaudio/librtaudio.a"
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

# LibPD Library
libpd_dir = "libpd"
libpd_lib = "libpd/build/Release/libpd-osx.a"
libpd.target = $$libpd_lib
macx{
   libpd.commands = cd $$libpd_dir && xcodebuild -project libpd.xcodeproj -target libpd-osx -configuration Release
}
QMAKE_EXTRA_TARGETS += libpd
PRE_TARGETDEPS += $$libpd_lib
INCLUDEPATH += $${libpd_dir}/cpp
LIBS += $$libpd_lib

# vim: set ft=make:
