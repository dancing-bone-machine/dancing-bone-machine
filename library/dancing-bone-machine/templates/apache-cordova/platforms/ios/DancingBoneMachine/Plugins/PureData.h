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

#import <Foundation/Foundation.h>
#import <Cordova/CDV.h>
#import "PdBase.h"
#import "PdAudioController.h"

#define MAX_ARRAY_SIZE 8192

@interface PureData : CDVPlugin <PdReceiverDelegate>{
float* readArrayBuffer;  
NSMutableArray* readArrayArray;
}


@property (nonatomic, retain) PdAudioController *audioController;

- (void)configurePlayback:(CDVInvokedUrlCommand*)command;
- (void)openFile:(CDVInvokedUrlCommand*)command;

@end
