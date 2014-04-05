#include <climits>
//#include <cwchar>

#include "Audio.h"
#include "Externals.h"

// define the static property puredata of type PdBase
pd::PdBase DBM::Audio::puredata;

// define the static property mutex of type QMutex
QMutex DBM::Audio::mutex;

int audioCallback(void *outputBuffer, void *inputBuffer, unsigned int nBufferFrames, double streamTime, RtAudioStreamStatus status, void *data){

   if (status!=0) {
      std::cout << "Stream over/underflow detected." << std::endl;
   }

   float* out = (float*)outputBuffer;
   float* in = (float*)inputBuffer;

   // Process 8 ticks, assuming block size of 512. Puredata processes in ticks of 64 samples
   DBM::Audio::mutex.lock();
   DBM::Audio::puredata.processFloat(8, in, out);
   DBM::Audio::mutex.unlock();
   
   // Echo
   // memcpy( outputBuffer, inputBuffer, nBufferFrames*4*2);

   // Noise
   // for(unsigned int i=0; i<nBufferFrames; i++) {
   //    for(unsigned int j=0; j<2; j++){
   //       rand = static_cast <float> (std::rand()) / static_cast <float> (RAND_MAX);
   //       *out = rand;
   //       out++;
   //    }
   // }

   return 0;

   (void)nBufferFrames;
   (void)streamTime;
   (void)status;
   (void)data;
}


DBM::Audio::Audio(){ }

DBM::Audio::~Audio(){
   this->stop();
}


unsigned int DBM::Audio::getSampleRate(){
   return this->sampleRate;
}

int DBM::Audio::start(){
   if ( rtaudio.getDeviceCount() == 0 ) return(0);

   // Get info for default audio device, choose the sample rate closer to 44100
   RtAudio::DeviceInfo device = rtaudio.getDeviceInfo( rtaudio.getDefaultOutputDevice() );
   std::vector<unsigned int> sampleRates = device.sampleRates;
   int diff = INT_MAX;
   sampleRate = 44100;
   for(size_t i=0; i<sampleRates.size(); i++){
      if( abs(sampleRates.at(i)-44100) < diff){
         sampleRate = sampleRates.at(i);
         diff = abs(sampleRate - 44100);
      }
   }

   Audio::mutex.lock();
   puredata.init(2,2,sampleRate);
   Externals::init();
   Audio::mutex.unlock();

   // int i = rtaudio.getDefaultOutputDevice();
   // RtAudio::DeviceInfo info = rtaudio.getDeviceInfo(i);
   // std::cout << info.name << std::endl;

   // i = rtaudio.getDefaultInputDevice();
   // info = rtaudio.getDeviceInfo(i);
   // std::cout << info.name << std::endl;

   // Initialize audio
   blockSize = 512;
   RtAudio::StreamParameters inputParams, outputParams;
   outputParams.deviceId = rtaudio.getDefaultOutputDevice();
   outputParams.nChannels = 2;
   inputParams.deviceId = rtaudio.getDefaultInputDevice();
   inputParams.nChannels = 2;

   RtAudio::StreamOptions options;
   options.flags = RTAUDIO_NONINTERLEAVED & RTAUDIO_SCHEDULE_REALTIME;
   try {
      rtaudio.openStream( &outputParams, &inputParams, RTAUDIO_FLOAT32, sampleRate, &blockSize, &audioCallback, NULL, &options);
      rtaudio.startStream();
   }
   catch ( RtError& e ) {
      std::cout << '\n' << e.getMessage() << '\n' << std::endl;
      return 0;
   }

   return 1;
}

int DBM::Audio::stop(){
   if(rtaudio.isStreamRunning()) rtaudio.stopStream();
   if(rtaudio.isStreamOpen()) rtaudio.closeStream();
   return 1;
};
