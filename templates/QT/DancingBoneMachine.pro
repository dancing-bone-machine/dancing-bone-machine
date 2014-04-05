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
SOURCES += ../../../app/vendors/getdir/getdir.c # getdir external
SOURCES += ../../../app/vendors/pdogg/oggread~.c # oggread~ external.
HEADERS += src/*.h
SOURCES += src/*.cpp

# HOA Externals
win32{
   DEFINES += _WINDOWS
}
HOA = ../../../app/vendors/hoa/HoaLibrary
CICM = ../../../app/vendors/hoa/CicmWrapper
SOURCES += $$CICM/Sources/eattr/*.c
SOURCES += $$CICM/Sources/ebox/*.c
SOURCES += $$CICM/Sources/eclass/*.c
SOURCES += $$CICM/Sources/ecommon/*.c
SOURCES += $$CICM/Sources/egraphics/*.c
SOURCES += $$CICM/Sources/epopup/*.c
SOURCES += $$CICM/Sources/ewidget/*.c

SOURCES += $$HOA/PureData/hoaMap/hoa.map~.cpp
SOURCES += $$HOA/Sources/hoaAmbisonics/Ambisonic.cpp
SOURCES += $$HOA/Sources/hoaEncoder/AmbisonicEncoder.cpp
SOURCES += $$HOA/Sources/hoaMap/AmbisonicMap.cpp
SOURCES += $$HOA/Sources/hoaMap/AmbisonicMultiMaps.cpp
SOURCES += $$HOA/Sources/hoaWider/AmbisonicWider.cpp
SOURCES += $$HOA/Sources/CicmLibrary/CicmLines/CicmLine.cpp

SOURCES += $$HOA/PureData/hoaDecoder/hoa.decoder~.cpp
SOURCES += $$HOA/Sources/hoaMultiDecoder/AmbisonicsMultiDecoder.cpp
SOURCES += $$HOA/Sources/hoaRestitution/AmbisonicsRestitution.cpp
SOURCES += $$HOA/Sources/hoaBinaural/AmbisonicsBinaural.cpp
SOURCES += $$HOA/Sources/hoaDecoder/AmbisonicsDecoder.cpp

SOURCES += $$HOA/PureData/hoaFreeverb/hoa.freeverb~.cpp
SOURCES += $$HOA/Sources/hoaFreeverb/AmbisonicFreeverb.cpp
SOURCES += $$HOA/Sources/CicmLibrary/CicmReverb/CicmFreeverb.cpp
SOURCES += $$HOA/Sources/CicmLibrary/CicmFilters/CicmFilterComb.cpp
SOURCES += $$HOA/Sources/CicmLibrary/CicmFilters/CicmFilterAllPass.cpp
SOURCES += $$HOA/Sources/CicmLibrary/CicmFilters/CicmFilter.cpp

SOURCES += $$HOA/PureData/hoaOptim/hoa.optim~.cpp
SOURCES += $$HOA/Sources/hoaOptim/AmbisonicOptim.cpp

# Output
DESTDIR = bin
TARGET = DancingBoneMachine
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
	&& rsync -avuL --del ../../../app/html/ $$RESOURCES_DIR/res/html \
	&& rsync -avuL --exclude=dbm-connect.pd  ../../../app/pd/ $$RESOURCES_DIR/res/pd \
   && rsync -avuL --exclude=*.pd_darwin --exclude=*.dll --exclude=*.lib  ../../../app/vendors/hoa/HoaLibrary/PureData/builds/ $$RESOURCES_DIR/res/pd/abstractions

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
   #deploy.commands = make distclean \
   deploy.commands = rm bin/DancingBoneMachine.exe && \
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
rtaudio_dir = "../../library/vendors/rtaudio"
rtaudio_lib = "../../library/vendors/rtaudio/librtaudio.a"
rtaudio.target = $$rtaudio_lib
INCLUDEPATH += $$rtaudio_dir
QMAKE_EXTRA_TARGETS += rtaudio
PRE_TARGETDEPS += $$rtaudio_lib
LIBS += $$rtaudio_lib
macx{
   DEFINES += __MACOSX_CORE__ 
   rtaudio.commands = cd $$rtaudio_dir && ./configure --with-core && make
   LIBS += -framework CoreFoundation
   LIBS += -framework CoreAudio
   LIBS += -framework Accelerate
}
win32{
   DEFINES += __WINDOWS_DS__ 
   rtaudio.commands = cd $$rtaudio_dir && ./configure --with-ds && make
}

# LibPD Library
libpd_dir = "../../library/vendors/libpd"
macx{
   libpd_lib = "vendors/libpd/build/Release/libpd-osx.a"
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

# vorbis library
vorbis_dir = ../../../app/vendors/libvorbis
win32{
   vorbis_install_dir = /usr/local/lib
   vorbis.commands = cd $$vorbis_dir && ./configure --with-ogg-libraries=/usr/local/lib --with-ogg-includes=/usr/local/include --disable-oggtest && make && make install 
}
vorbis_lib = $$vorbis_install_dir/libvorbis.a
vorbis.depends = ogg
vorbis.target = $$vorbis_lib
QMAKE_EXTRA_TARGETS += vorbis
PRE_TARGETDEPS += $$vorbis_lib
INCLUDEPATH += $$vorbis_dir/include
LIBS += $$vorbis_install_dir/libvorbisfile.a $$vorbis_lib $$vorbis_install_dir/libvorbisenc.a 

# ogg library
ogg_dir = ../../../app/vendors/libogg
win32{
   ogg_lib = /usr/local/lib/libogg.a
   ogg.commands = cd $$ogg_dir && ./configure && make && make install
}
ogg.target = $$ogg_lib
QMAKE_EXTRA_TARGETS += ogg
PRE_TARGETDEPS += $$ogg_lib
INCLUDEPATH += $$ogg_dir/include
LIBS += $$ogg_lib

# GNU Science Library (only needed in win)
win32{
   gsl_dir = ../../../app/vendors/libgsl
   gsl_lib = /usr/local/lib/libgsl.a

   INCLUDEPATH += /usr/local/include
   LIBS += /usr/local/lib/libgslcblas.a /usr/local/lib/libgsl.a

   gsl.commands = cd $$gsl_dir && ./configure && make && make install
   gsl.target = $$gsl_lib
   QMAKE_EXTRA_TARGETS += gsl
   PRE_TARGETDEPS += $$gsl_lib
}

# system libraries for windows
win32{
   #QMAKE_LFLAGS += -static -static-libstdc++ -static-libgcc
   LIBS += -lstdc++ 
   LIBS += -lgcc
   LIBS += -lpthread
   LIBS += -ldsound
   LIBS += -lwinmm
   LIBS += -lole32
   LIBS += -lws2_32
}

# vim: set ft=make:
