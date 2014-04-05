#pragma once

namespace DBM{
   class Externals{
      public:
         static void init(); 
   };
};

extern "C"{
	void oggread_tilde_setup(void);
	void getdir_setup(void);
	void setup_hoa0x2emap_tilde(void);
	void setup_hoa0x2edecoder_tilde(void);
	void setup_hoa0x2efreeverb_tilde(void);
	void setup_hoa0x2eoptim_tilde(void);
}

void DBM::Externals::init(){
	oggread_tilde_setup();
	getdir_setup();
	setup_hoa0x2emap_tilde();
	setup_hoa0x2edecoder_tilde();
	setup_hoa0x2efreeverb_tilde();
	setup_hoa0x2eoptim_tilde();
}