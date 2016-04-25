//
//  SKSConfiguration.mm
//  SpeechKitSample
//
//  All Nuance Developers configuration parameters can be set here.
//
//  Copyright (c) 2015 Nuance Communications. All rights reserved.
//

#import "SKSConfiguration.h"

// All fields are required.
// Your credentials can be found in your Nuance Developers portal, under "Manage My Apps".
NSString* SKSAppKey = @"1f33e486bf72d21f681fc9dcffe47b3b158bb460bfd9aefbf8a6ebae9793b4b6c6983c850a0ea4722d6d4e2c52ca6867551cc814f57610ee1cfb9cb48e506a54";
NSString* SKSAppId = @"NMDPTRIAL_tugricurartu_gmail_com20160424194004";
NSString* SKSServerHost = @"sslsandbox.nmdp.nuancemobility.net";
NSString* SKSServerPort = @"443";

NSString* SKSLanguage = @"eng-USA";

NSString* SKSServerUrl = [NSString stringWithFormat:@"nmsps://%@@%@:%@", SKSAppId, SKSServerHost, SKSServerPort];

// Only needed if using NLU/Bolt
NSString* SKSNLUContextTag = @"search";

