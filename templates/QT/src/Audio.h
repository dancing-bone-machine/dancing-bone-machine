#pragma once

#include <RtAudio.h>
#include <PdBase.hpp>


namespace DBM{
   class Audio{
      public:
         Audio();
         ~Audio();
         void start();
         void stop();

      protected: 
         unsigned int sampleRate;
         unsigned int blockSize;
         RtAudio rtaudio;
         pd::PdBase pd;
   };
};
