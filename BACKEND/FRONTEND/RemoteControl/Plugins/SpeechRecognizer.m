//
//  SpeechRecognizer.m
//  RemoteControl
//
//  Created by Mikhail Arov on 7/13/14.
//
//

#import "SpeechRecognizer.h"

@implementation SpeechRecognizer
@synthesize openEarsPlugin;

/*
 * Initialize Speech Recognizer
 */
- (void) init:(CDVInvokedUrlCommand*)command{
    
    NSLog(@"SpeechRecognizer.init: Entered method.");
    
    //get the callback id and save it for later
    NSString *callbackId = command.callbackId;
    if (recoCallbackId != nil){
        [recoCallbackId dealloc];
    }
    recoCallbackId = [callbackId mutableCopy];
    NSLog(@"SpeechRecognizer.startRecognition: Call back id [%@].", recoCallbackId);
    
    openEarsPlugin = [[OpenEarsPlugin alloc] init];
    openEarsPlugin.delegate = self;
    [openEarsPlugin startListening];
    
    [NSThread sleepForTimeInterval:5.0];
    
    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [result setKeepCallbackAsBool:YES];
    
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
    
    NSLog(@"SpeechRecognizer.init: Leaving method.");
}

/*
 * Cleans up speech recognizer when done.
 */
- (void) cleanup:(CDVInvokedUrlCommand*)command{
    
    NSLog(@"SpeechRecognizer.cleanup: Entered method.");
    
    openEarsPlugin.delegate = nil;
    [openEarsPlugin dealloc];
    
    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
    
    NSLog(@"SpeechRecognizer.cleanup: Leaving method.");
}


/*
 * Start speech recognition with parameters passed in
 */
- (void) startRecognition:(CDVInvokedUrlCommand*)command{
    
    NSLog(@"SpeechRecognizer.startRecognition: Entered method.");
    
    CDVPluginResult *result;
    
    //get the callback id and save it for later
    NSString *callbackId = command.callbackId;
    if (recoCallbackId != nil){
        [recoCallbackId dealloc];
    }
    recoCallbackId = [callbackId mutableCopy];
    NSLog(@"SpeechRecognizer.startRecognition: Call back id [%@].", recoCallbackId);

    int numArgs = [command.arguments count];
    if (numArgs >= 2){
        
        NSString *recoType = [command.arguments objectAtIndex:0];
        NSLog(@"SpeechRecognizer.startRecognition: Reco type [%@].", recoType);
        NSString *lang = [command.arguments objectAtIndex:1];
        NSLog(@"SpeechRecognizer.startRecognition: Language [%@].", lang);
        
    }
    
    result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [result setKeepCallbackAsBool:YES];
    
    [self.commandDelegate sendPluginResult:result callbackId:callbackId];
    
    NSLog(@"SpeechRecognizer.startRecognition: Leaving method.");
}


/*
 * Stops recognition that has previously been started
 */
- (void) stopRecognition:(CDVInvokedUrlCommand*)command{
    
    
    NSLog(@"SpeechRecognizer.stopRecognition: Entered method.");
    
    //get the callback id
    NSString *callbackId = command.callbackId;
    
    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [result setKeepCallbackAsBool:YES];
    
    [self.commandDelegate sendPluginResult:result callbackId:callbackId];
    
    NSLog(@"SpeechRecognizer.stopRecognition: Leaving method.");
    
}

/*
 * Gets the result from the previous successful recognition
 */
- (void) getResult:(NSString*)resultText{
    
    NSLog(@"SpeechRecognizer.getResult: Entered method.");
    
    //NSString *resultText = @"Speech recognizer result";
    
    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:resultText];
    [result setKeepCallbackAsBool:YES];

    NSLog(@"SpeechRecognizer.getResult: recoCallbackId [%@].", recoCallbackId);
    
    [self.commandDelegate sendPluginResult:result callbackId:recoCallbackId];
    
    NSLog(@"SpeechRecognizer.getResult: Leaving method.");
    
}

@end
