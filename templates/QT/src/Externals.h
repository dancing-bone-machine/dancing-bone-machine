#pragma once

namespace DBM{
   class Externals{
      public:
         static void init(); 
   };
};

extern "C"{
   void oggread_tilde_setup(void);
}

void DBM::Externals::init(){
   oggread_tilde_setup();
}
