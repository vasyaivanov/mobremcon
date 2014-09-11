//
//  VolumeButtonControl.h
//  RemoteControl
//
//  Created by Lev on 9/10/14.
//
//

#import <Cordova/CDV.h>
#import <MediaPlayer/MediaPlayer.h>


@class RBVolumeButtons;

@interface VolumeButtonControl : CDVPlugin {
    NSString* recoCallbackId;
    float launchVolume;
    RBVolumeButtons *_buttonStealer;
}

@property (retain) RBVolumeButtons *buttonStealer;

// Initialize Volume Button Control
- (void) init:(CDVInvokedUrlCommand*)command;

@end