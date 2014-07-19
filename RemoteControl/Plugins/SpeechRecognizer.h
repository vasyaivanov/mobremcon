//
//  SpeechRecognizer.h
//  RemoteControl
//
//  Created by Mikhail Arov on 7/13/14.
//
//

#import <Cordova/CDV.h>
#import "Engines/OpenEarsPlugin.h"

@interface SpeechRecognizer : CDVPlugin<OpenEarsPluginDelegate>{

    NSString* recoCallbackId;
    OpenEarsPlugin* openEarsPlugin;
}

@property (nonatomic, strong) OpenEarsPlugin* openEarsPlugin;

// Initialize Speech Recognizer
- (void) init:(CDVInvokedUrlCommand*)command;
// Clean up Speech Recognizer
- (void) cleanup:(CDVInvokedUrlCommand*)command;

// Start speech recognition
- (void) startRecognition:(CDVInvokedUrlCommand*)command;
// Stop speech recognition
- (void) stopRecognition:(CDVInvokedUrlCommand*)command;

// Get the last recognition results
- (void) getResult:(NSString*)resultText;

@end
