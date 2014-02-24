#include <iostream>
#include <QWebFrame>
#include <QMap>
#include "PdBridge.h"


DBM::PdBridge::PdBridge(QObject* parent) : QObject(parent){}

void DBM::PdBridge::setPage(WebPage* page){
   this->page = page;
}

// void DBM::PdBridge::fireCallback(QString& callbackID, QVariantList& params){
//    page->
// }
   
////////////////////////////////////////////////////////////////////////////////
// The following methods can be called from Javascript as members of a global
// PD object. PD.configurePlayback(...) for example.


// void PdBridge::configurePlayback(int sampleRate, int numberChannels, bool inputEnabled, bool mixingEnabled, QString callback){
void DBM::PdBridge::configurePlayback(int sampleRate, int numberChannels, bool inputEnabled, bool mixingEnabled, QString callbackOK, QString callbackErr){
   

   std::cout << "C++ doing work for configure playback" << std::endl;
   // std::cout << callbackOK << std::endl;

   QVariantMap params;
   params["pi"] = QVariant(3.1415);
   params["msg"] = QVariant("Hi from C++");

   // std::cout << qPrintable(params) << std::endl;

   emit fireCallback(callbackOK, params);

   // This parameter is not used in the C++ version, kept here to keep 
   // compatibility with other runtimes.
   // (void)mixingEnabled;
}

/*

////////////////////////////////////////////////////////////////////////
#pragma mark --
#pragma mark Javascript Visible Methods

- (void)configurePlayback:(CDVInvokedUrlCommand*)command {
  __block int sampleRate = [(NSNumber*)[command.arguments objectAtIndex:0] intValue];
  __block int numberChannels = [(NSNumber*)[command.arguments objectAtIndex:1] intValue];
  __block int inputEnabled = [(NSNumber*)[command.arguments objectAtIndex:2] boolValue];
  __block int mixingEnabled = [(NSNumber*)[command.arguments objectAtIndex:3] boolValue];
  
  [self.commandDelegate runInBackground:^{
    PdAudioStatus status = [self.audioController configurePlaybackWithSampleRate:sampleRate numberChannels:numberChannels inputEnabled:inputEnabled mixingEnabled:mixingEnabled];
    
    CDVPluginResult* pluginResult = nil;
    if(status == PdAudioOK){
      [self setupExternals];
      
      pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    }
    else if(status == PdAudioPropertyChanged){
      sampleRate = [self.audioController sampleRate];
      numberChannels = [self.audioController numberChannels];
      inputEnabled = [self.audioController inputEnabled];
      mixingEnabled = [self.audioController mixingEnabled];
      NSDictionary* params = [NSDictionary dictionaryWithObjectsAndKeys:
                              [NSNumber numberWithInt:sampleRate], @"sampleRate",
                              [NSNumber numberWithInt:numberChannels], @"numberChannels",
                              [NSNumber numberWithBool:inputEnabled], @"inputEnabled",
                              [NSNumber numberWithBool:mixingEnabled], @"mixingEnabled",
                              nil];
      [self setupExternals];
      
      pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:params];
    }
    else{ // if(status == pdAudioError)
      // TODO: test this.
      NSString* msg = [NSString stringWithFormat:@"Could not configure audio playback. SampleRate:%i, NumChannels:%i, inputEnabled:%d, mixingEnabled:%d", sampleRate, numberChannels, inputEnabled, mixingEnabled];
      pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:msg];
    }
    
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    
    // TODO: where should I put this?
    [PdBase setDelegate:self];

    
    
//    NSString* payload = nil;
//    // Some blocking logic...
//    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:payload];
//    // The sendPluginResult method is thread-safe.
//    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
  }];

  
}

- (void)openFile:(CDVInvokedUrlCommand*)command {
  NSString* dir = [command.arguments objectAtIndex:0];
  __block NSString* fileName = [command.arguments objectAtIndex:1];
  __block NSString* path = [[[NSBundle mainBundle] resourcePath] stringByAppendingPathComponent:dir];
  [self.commandDelegate runInBackground:^{
    CDVPluginResult* pluginResult = nil;
    if([PdBase openFile:fileName path:path]==nil){
      NSString* msg = [NSString stringWithFormat:@"Could not open PD patch %@/%@", path, fileName];
      pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:msg];
    }
    else{
      pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    }
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
  }];
}

- (void)setActive:(CDVInvokedUrlCommand*)command {
  BOOL active = [[command.arguments objectAtIndex:0] boolValue];

  [self.audioController setActive:active];

  CDVPluginResult* pluginResult = nil;
  if([self.audioController isActive]!=active){
    NSString* msg = [NSString stringWithFormat:@"Could not (de)activate audio controller. active: %d", active];
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:msg];
  }
  else{
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
  }
  [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void)sendNoteOn:(CDVInvokedUrlCommand*)command {
  float channel = [[command.arguments objectAtIndex:0] floatValue];
  float pitch = [[command.arguments objectAtIndex:1] floatValue];
  float velocity = [[command.arguments objectAtIndex:2] floatValue];

  [PdBase sendNoteOn:channel pitch:pitch velocity:velocity];

  CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
  [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void)sendFloat:(CDVInvokedUrlCommand*)command {
  float f = [[command.arguments objectAtIndex:0] floatValue];
  NSString* receiver = [command.arguments objectAtIndex:1]; 

  [PdBase sendFloat:f toReceiver:receiver];

  CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
  [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];

}

- (void)sendBang:(CDVInvokedUrlCommand*)command {
    NSString* receiver = [command.arguments objectAtIndex:0];
    
    [PdBase sendBangToReceiver:receiver];
    
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    
}

- (void)sendSymbol:(CDVInvokedUrlCommand*)command {
    NSString* value = [command.arguments objectAtIndex:0];
    NSString* receiver = [command.arguments objectAtIndex:1];
    
    [PdBase sendSymbol:value toReceiver:receiver];
    
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    
}

- (void)readArray:(CDVInvokedUrlCommand*)command {
  NSString* arrayName = (NSString*)[command.arguments objectAtIndex:0];
  __block int n = [(NSNumber*)[command.arguments objectAtIndex:1] intValue];
  __block int offset = [(NSNumber*)[command.arguments objectAtIndex:2] intValue];
    
    if(n==0){
        n = [PdBase arraySizeForArrayNamed:arrayName];
    }
    
  [self.commandDelegate runInBackground:^{
    CDVPluginResult* pluginResult = nil;
    if(n > MAX_ARRAY_SIZE) n = MAX_ARRAY_SIZE;
    if(![PdBase copyArrayNamed:arrayName withOffset:offset toArray:readArrayBuffer count:n]){
        [readArrayArray removeAllObjects];
        for(int i=0; i<n; i++){
          [readArrayArray addObject:[NSNumber numberWithFloat:readArrayBuffer[i]]];
        }
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsArray:readArrayArray];
    }
    else{
        NSString* msg = [NSString stringWithFormat:@"Could not read array %@", arrayName];
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:msg];
    }
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
  }];
}

- (void)showMediaPicker:(CDVInvokedUrlCommand*)command {
    MPMediaPickerController *pickerController =	[[MPMediaPickerController alloc] initWithMediaTypes: MPMediaTypeAnyAudio];
    pickerController.prompt = @"Choose an audio track";
    pickerController.allowsPickingMultipleItems = NO;
    pickerController.delegate = self;
    _currentCommand = command;
    [self.viewController presentViewController:pickerController animated:YES completion:nil];
}


// TODO: where should I put this?
// // [PdBase setDelegate:self];
- (void)receivePrint:(NSString *)message {
  NSLog(@"Pd Console: %@", message);
}


   */
