#include "Audio.h"

int audioCallback(void *outputBuffer, void *inputBuffer, unsigned int nBufferFrames, double streamTime, RtAudioStreamStatus status, void *data){

   float* out = (float*)outputBuffer;
   float rand; 
   
   // Echo
   // if ( status ) std::cout << "Stream over/underflow detected." << std::endl;
   // memcpy( outputBuffer, inputBuffer, nBufferFrames*4*2);

   // Noise
   // for(unsigned int i=0; i<nBufferFrames; i++) {
   //    for(unsigned int j=0; j<2; j++){
   //       rand = static_cast <float> (std::rand()) / static_cast <float> (RAND_MAX);
   //       *out = rand;
   //       out++;
   //    }
   // }
   // (void)nBufferFrames;
   // (void)streamTime;

   return 0;
}

Audio::Audio(){

}

Audio::~Audio(){
   this->stop();
}

void Audio::start(){
   if ( rtaudio.getDeviceCount() == 0 ) exit( 0 );

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

   // int i = rtaudio.getDefaultOutputDevice();
   // RtAudio::DeviceInfo info = rtaudio.getDeviceInfo(i);
   // std::cout << info.name << std::endl;

   // i = rtaudio.getDefaultInputDevice();
   // info = rtaudio.getDeviceInfo(i);
   // std::cout << info.name << std::endl;

   // Initialize audio
   blockSize = 64;
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
      exit( 0 );
   }

   // pd.init(1,2,44100);
}

void Audio::stop(){
   if(rtaudio.isStreamRunning()) rtaudio.stopStream();
   if(rtaudio.isStreamOpen()) rtaudio.closeStream();
};