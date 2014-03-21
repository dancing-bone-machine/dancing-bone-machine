#pragma once

#include <RtAudio.h>
#include <PdBase.hpp>
#include <QMutex>

namespace DBM{
   class Audio{
      public:
         static pd::PdBase puredata;
         static QMutex mutex;

         explicit Audio();
         virtual ~Audio();

         int openPatch(std::string file, std::string path);
         int start();
         int stop();
         unsigned int getSampleRate();

      protected: 
         unsigned int sampleRate;
         unsigned int blockSize;
         RtAudio rtaudio;
   };
};
