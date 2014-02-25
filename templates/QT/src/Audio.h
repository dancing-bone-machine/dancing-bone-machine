#pragma once

#include <RtAudio.h>
#include <PdBase.hpp>


namespace DBM{
   class Audio{
      public:
         explicit Audio();
         virtual ~Audio();
         int openPatch(std::string file, std::string path);
         int start();
         int stop();
         unsigned int getSampleRate();
         static pd::PdBase puredata;

      protected: 
         unsigned int sampleRate;
         unsigned int blockSize;
         RtAudio rtaudio;
   };
};
