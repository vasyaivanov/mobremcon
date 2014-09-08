//
//  VolumeButtonControl.m
//  RemoteControl
//
//  Created by Lev Stefanovich on 09/07/2014.
//
//

#import "VolumeButtonControl.h"
#import "RBVolumeButtons.h"

@implementation VolumeButtonControl

@synthesize buttonStealer = _buttonStealer;

- (void) init:(CDVInvokedUrlCommand*)command{
    
    //get the callback id and save it for later
    NSString *callbackId = command.callbackId;
    if (recoCallbackId != nil){
        [recoCallbackId dealloc];
    }
    recoCallbackId = [callbackId mutableCopy];
    
    // Initialize the button Stealer
    self.buttonStealer = [[RBVolumeButtons alloc] init];
    [self.buttonStealer startStealingVolumeButtonEvents];
    self.buttonStealer.upBlock = ^{
        CDVPluginResult *result =[CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsInt:101];
        [result setKeepCallbackAsBool:YES];
    
        [self.commandDelegate sendPluginResult:result callbackId:recoCallbackId];
    };
    
    self.buttonStealer.downBlock = ^{
        CDVPluginResult *result =[CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsInt:102];
        [result setKeepCallbackAsBool:YES];
    
        [self.commandDelegate sendPluginResult:result callbackId:recoCallbackId];
    };
    
    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [result setKeepCallbackAsBool:YES];
    
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

@end
