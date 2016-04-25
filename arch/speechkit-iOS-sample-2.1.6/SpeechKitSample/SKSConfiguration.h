//
//  SKSConfiguration.h
//  SpeechKitSample
//
//  Copyright (c) 2015 Nuance Communications. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <SpeechKit/SpeechKit.h>

#define LANGUAGE ([SKSLanguage isEqualToString:@"!LANGUAGE!"] ? @"eng-USA" : SKSLanguage)

extern NSString* SKSAppKey;
extern NSString* SKSAppId;
extern NSString* SKSServerHost;
extern NSString* SKSServerPort;

extern NSString* SKSLanguage;

extern NSString* SKSNLUContextTag;

extern NSString* SKSServerUrl;