#pragma once

namespace DBM{
   class Externals{
      public:
         static void init(); 
   };
};

extern "C"{
	// void getdir_setup(void);
}

void DBM::Externals::init(){
	// getdir_setup();
}
