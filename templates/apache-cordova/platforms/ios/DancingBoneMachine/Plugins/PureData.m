/*
    Copyright (c) 2013 Rafael Vega González <rvega@elsoftwarehamuerto.org>

    This file is part of Dancing Bone Machine.

    Dancing Bone Machine is free software; you can redistribute it and/or modify it under
    the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

    Dancing Bone Machine is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

#import "PureData.h"
#import "PdBase.h"
#import "PdFile.h"

@implementation PureData

////////////////////////////////////////////////////////////////////////
#pragma mark --
#pragma mark Externals

/**
  * Go ahead and setup your externals here.
  */

// extern void your_external_setup(void);
// extern void another_external_setup(void);
//extern void z_tilde_setup(void);
//extern void limiter_tilde_setup(void);
//extern void freeverb_tilde_setup(void);

-(void) setupExternals{
  //  your_external_setup();
  //  another_external_setup();
  /* z_tilde_setup(); */
  /* limiter_tilde_setup(); */
  /* freeverb_tilde_setup(); */
}

- (void)pluginInitialize {
   [super pluginInitialize];
   readArrayBuffer = (float*)malloc(MAX_ARRAY_SIZE*sizeof(float));
   readArrayArray = [NSMutableArray arrayWithCapacity:MAX_ARRAY_SIZE];
}

- (void)dispose {
   [super dispose];
   free(readArrayBuffer);
   readArrayBuffer = NULL;
}

////////////////////////////////////////////////////////////////////////
#pragma mark --
#pragma mark Accessors

@synthesize audioController = _audioController;

// This getter will instantiate _audioController when needed.
- (PdAudioController*)audioController{
  if(_audioController == nil){
    self.audioController = [[PdAudioController alloc] init];
  }
  return _audioController;
}

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
  __block NSString* path = [[[NSBundle mainBundle] resourcePath] stringByAppendingPathComponent:dir]; [self.commandDelegate runInBackground:^{ 
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

- (void)readArray:(CDVInvokedUrlCommand*)command {
  NSString* arrayName = (NSString*)[command.arguments objectAtIndex:0];
  __block int n = [(NSNumber*)[command.arguments objectAtIndex:1] intValue];
  __block int offset = [(NSNumber*)[command.arguments objectAtIndex:2] intValue];
  [self.commandDelegate runInBackground:^{
    CDVPluginResult* pluginResult = nil;
    if(n > MAX_ARRAY_SIZE) n = MAX_ARRAY_SIZE;
    if(![PdBase copyArrayNamed:arrayName withOffset:offset toArray:readArrayBuffer count:n]){
        [readArrayArray removeAllObjects];
        for(int i=0; i<n; i++){
          [readArrayArray addObject:[NSNumber numberWithFloat:readArrayBuffer[i]]];
        }
        /* NSData* data = [NSData dataWithBytes:readArrayBuffer length:MAX_ARRAY_SIZE*sizeof(float)]; */
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
/* [PdBase setDelegate:self]; */
- (void)receivePrint:(NSString *)message {
  NSLog(@"Pd Console: %@", message);
}


////////////////////////////////////////////////////////////////////////
#pragma mark --
#pragma mark Media Picker
- (void)mediaPicker: (MPMediaPickerController *)mediaPicker didPickMediaItems:(MPMediaItemCollection *)mediaItemCollection {
    [self.viewController dismissModalViewControllerAnimated:YES];
    [self.commandDelegate runInBackground:^{
        __block CDVPluginResult* pluginResult = nil;
        NSString* msg = nil;
        
        if ([mediaItemCollection count] < 1) {
            msg = @"No audio track was chosen";
            pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:msg];
            return;
        }
        MPMediaItem* song = [[mediaItemCollection items] objectAtIndex:0];
        NSString* songTitle = [song valueForProperty:MPMediaItemPropertyTitle]!=nil ? [song valueForProperty:MPMediaItemPropertyTitle] : @"";
        NSString* songAlbum = [song valueForProperty:MPMediaItemPropertyAlbumTitle] ? [song valueForProperty:MPMediaItemPropertyAlbumTitle] : @"";
        NSString* songArtist = [song valueForProperty:MPMediaItemPropertyArtist] ? [song valueForProperty:MPMediaItemPropertyArtist] : @"";
        
        /////////////////////////////////////
        // Begin converting song
        
        NSString* newFileName = [NSString stringWithFormat:@"%@-%@-%@", songTitle, songAlbum, songArtist];
        NSCharacterSet* illegalFileNameCharacters = [NSCharacterSet characterSetWithCharactersInString:@"./\\?%*|\"<> "];
        newFileName = [[newFileName componentsSeparatedByCharactersInSet:illegalFileNameCharacters] componentsJoinedByString:@""];
        newFileName = [NSString stringWithFormat:@"%@.caf", newFileName];
        
        // set up an AVAssetReader to read from the iPod Library
        NSURL *assetURL = [song valueForProperty:MPMediaItemPropertyAssetURL];
        AVURLAsset *songAsset = [AVURLAsset URLAssetWithURL:assetURL options:nil];
        
        NSError *assetError = nil;
        AVAssetReader *assetReader = [AVAssetReader assetReaderWithAsset:songAsset error:&assetError];
        if(assetError) {
            msg = [NSString stringWithFormat:@"Error: %@", assetError];
            pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:msg];
            [self.commandDelegate sendPluginResult:pluginResult callbackId:_currentCommand.callbackId];
            return;
        }
        
        AVAssetReaderOutput *assetReaderOutput = [AVAssetReaderAudioMixOutput assetReaderAudioMixOutputWithAudioTracks:songAsset.tracks audioSettings: nil];
        if (! [assetReader canAddOutput: assetReaderOutput]) {
            msg = @"Can't add reader output.";
            pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:msg];
            [self.commandDelegate sendPluginResult:pluginResult callbackId:_currentCommand.callbackId];
            return;
        }
        [assetReader addOutput: assetReaderOutput];
        
        NSArray *dirs = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
        NSString *documentsDirectoryPath = [dirs objectAtIndex:0];
        NSString *exportPath = [documentsDirectoryPath stringByAppendingPathComponent:newFileName];
        if ([[NSFileManager defaultManager] fileExistsAtPath:exportPath]) {
            [[NSFileManager defaultManager] removeItemAtPath:exportPath error:nil];
        }
        NSURL *exportURL = [NSURL fileURLWithPath:exportPath];
        AVAssetWriter *assetWriter = [AVAssetWriter assetWriterWithURL:exportURL fileType:AVFileTypeCoreAudioFormat error:&assetError];
        if (assetError) {
            msg = [NSString stringWithFormat:@"Error: %@", assetError];
            pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:msg];
            [self.commandDelegate sendPluginResult:pluginResult callbackId:_currentCommand.callbackId];
            return;
        }
        AudioChannelLayout channelLayout;
        memset(&channelLayout, 0, sizeof(AudioChannelLayout));
        channelLayout.mChannelLayoutTag = kAudioChannelLayoutTag_Stereo;
        NSDictionary *outputSettings = [NSDictionary dictionaryWithObjectsAndKeys:
                                        [NSNumber numberWithInt:kAudioFormatLinearPCM], AVFormatIDKey,
                                        [NSNumber numberWithFloat:44100.0], AVSampleRateKey,
                                        [NSNumber numberWithInt:2], AVNumberOfChannelsKey,
                                        [NSData dataWithBytes:&channelLayout length:sizeof(AudioChannelLayout)], AVChannelLayoutKey,
                                        [NSNumber numberWithInt:16], AVLinearPCMBitDepthKey,
                                        [NSNumber numberWithBool:NO], AVLinearPCMIsNonInterleaved,
                                        [NSNumber numberWithBool:NO],AVLinearPCMIsFloatKey,
                                        [NSNumber numberWithBool:NO], AVLinearPCMIsBigEndianKey,
                                        nil];
        AVAssetWriterInput *assetWriterInput = [AVAssetWriterInput assetWriterInputWithMediaType:AVMediaTypeAudio outputSettings:outputSettings];
        if ([assetWriter canAddInput:assetWriterInput]) {
            [assetWriter addInput:assetWriterInput];
        } else {
            msg = @"Can't add asset writer input.";
            pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:msg];
            [self.commandDelegate sendPluginResult:pluginResult callbackId:_currentCommand.callbackId];
            return;
        }
        
        assetWriterInput.expectsMediaDataInRealTime = NO;
        
        [assetWriter startWriting];
        [assetReader startReading];
        
        AVAssetTrack *soundTrack = [songAsset.tracks objectAtIndex:0];
        CMTime startTime = CMTimeMake (0, soundTrack.naturalTimeScale);
        [assetWriter startSessionAtSourceTime: startTime];
        
        __block UInt64 convertedByteCount = 0;
        
        dispatch_queue_t mediaInputQueue = dispatch_queue_create("mediaInputQueue", NULL);
        [assetWriterInput requestMediaDataWhenReadyOnQueue:mediaInputQueue usingBlock: ^{
            while (assetWriterInput.readyForMoreMediaData) {
                CMSampleBufferRef nextBuffer = [assetReaderOutput copyNextSampleBuffer];
                if (nextBuffer) {
                    // append buffer
                    [assetWriterInput appendSampleBuffer: nextBuffer];
                    convertedByteCount += CMSampleBufferGetTotalSampleSize (nextBuffer);
                    //NSNumber *convertedByteCountNumber = [NSNumber numberWithLong:convertedByteCount];
                    //[self performSelectorOnMainThread:@selector(updateSizeLabel:) withObject:convertedByteCountNumber waitUntilDone:NO];
                } else {
                    // done!
                    [assetWriterInput markAsFinished];
                    [assetWriter finishWriting];
                    [assetReader cancelReading];
                    
                    NSDictionary* returnValues = [NSDictionary dictionaryWithObjectsAndKeys:
                                            songTitle, @"title",
                                            songAlbum, @"album",
                                            songArtist, @"artist",
                                            exportPath, @"path",
                                            nil];
                    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:returnValues];
                    [self.commandDelegate sendPluginResult:pluginResult callbackId:_currentCommand.callbackId];

                    //NSDictionary *outputFileAttributes = [[NSFileManager defaultManager] attributesOfItemAtPath:exportPath error:nil];
                    //NSLog (@"done. file size is %lld", [outputFileAttributes fileSize]);
                    //NSNumber *doneFileSize = [NSNumber numberWithLong:[outputFileAttributes fileSize]];
                    //[self performSelectorOnMainThread:@selector(updateCompletedSizeLabel:) withObject:doneFileSize waitUntilDone:NO];
                    break;
                }
            }
        }];
    }];
}

- (void)mediaPickerDidCancel:(MPMediaPickerController *)mediaPicker {
    [self.viewController dismissModalViewControllerAnimated:YES];
    [self.commandDelegate runInBackground:^{
        NSString* msg = [NSString stringWithFormat:@"User cancelled selection"];
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:msg];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:_currentCommand.callbackId];
    }];
}
@end
