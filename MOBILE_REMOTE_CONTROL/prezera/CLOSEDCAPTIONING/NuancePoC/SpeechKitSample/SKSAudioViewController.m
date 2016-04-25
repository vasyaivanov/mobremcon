//
//  SKSAudioViewController.m
//  SpeechKitSample
//
//  This Controller is built to demonstrate how to play an Audio file.
//
//  SpeechKit gives you the ability to play an audio file that is packaged with you application. This
//  is especially useful for playing earcons. Earcons are what notify the user of the listening state.
//
//  In this example we play a file stored in '/Resources'.
//
//  Note: We are using the same technique to play earcons in SKSASRViewController.m and SKSNLUViewController.m
//
//  Copyright (c) 2015 Nuance Communications. All rights reserved.
//

#import "SKSAudioViewController.h"
#import "SKSConfiguration.h"
#import <SpeechKit/SpeechKit.h>

@interface SKSAudioViewController () <SKAudioPlayerDelegate> {
    SKSession* _skSession;
    SKAudioFile* _audioFile;
    NSUInteger _repeatCount;
}

@end

@implementation SKSAudioViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    
    self.repetitionText.text = [@(self.repetitionStepper.value) stringValue];
    
    // Create a session
    _skSession = [[SKSession alloc] initWithURL:[NSURL URLWithString:SKSServerUrl] appToken:SKSAppKey];
    if (!_skSession) {
        UIAlertView* alertView = [[UIAlertView alloc]initWithTitle:@"SpeechKit"
                                                           message:@"Failed to initialize SpeechKit session."
                                                          delegate:nil cancelButtonTitle:@"OK"
                                                 otherButtonTitles:nil, nil];
        [alertView show];
    }
    
    _skSession.audioPlayer.delegate = self;
    
    // Create a SKAudio and load it from disk
    NSString* filePath = [[NSBundle mainBundle] pathForResource:@"sk_start" ofType:@"pcm"];
    SKPCMFormat* audioFormat = [[SKPCMFormat alloc] init];
    audioFormat.sampleFormat = SKPCMSampleFormatSignedLinear16;
    audioFormat.sampleRate = 16000;
    audioFormat.channels = 1;
    _audioFile = [[SKAudioFile alloc] initWithURL:[NSURL fileURLWithPath:filePath] pcmFormat:audioFormat];
    if (_audioFile == nil) {
        UIAlertView* alertView = [[UIAlertView alloc]initWithTitle:@"SpeechKit"
                                                           message:@"Failed to initialize SKAudio."
                                                          delegate:nil cancelButtonTitle:@"OK"
                                                 otherButtonTitles:nil, nil];
        [alertView show];
        
    }
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}


#pragma mark - Audio Actions

- (IBAction)toggleAudioPlayback:(UIButton *)sender
{
    // Disable the enqueue button
    [self.toggleAudioButton setEnabled:NO];
    
    _repeatCount = (NSUInteger)self.repetitionStepper.value;
    NSUInteger audioCreateCount = _repeatCount;
    
    // Tell the SKAudioPlayer to play SKAudios when they are queued
    [_skSession.audioPlayer play];
    
    // Enqueue the Audio z-times
    while (audioCreateCount--) {
        [_skSession.audioPlayer enqueue:_audioFile];
    }
}

#pragma mark - SKAudioPlayerDelegate

- (void)audioPlayer:(SKAudioPlayer *)player willBeginPlaying:(SKAudio *)audio
{
    [self log:@"willBeginPlaying"];
    
    // The SKAudio will begin playing
}

- (void)audioPlayer:(SKAudioPlayer *)player didFinishPlaying:(SKAudio *)audio
{
    [self log:@"didFinishPlaying"];
    
    // The SKAudio has finished playing
    
    // If the last SKAudio is finished playing then stop the SKAudioPlayer to free resources
    // and re-enable the enqueue button.
    if (0 == --_repeatCount) {
        [_skSession.audioPlayer stop];
        [self.toggleAudioButton setEnabled:YES];
    }
}

#pragma mark - Other Actions

- (IBAction)clearLogs:(UIButton *)sender
{
    self.logTextView.text = @"";
}
- (IBAction)stepperValueChanged:(UIStepper *)sender {
    self.repetitionText.text = [@(self.repetitionStepper.value) stringValue];
}

#pragma mark - Helpers

- (void)log:(NSString *)message
{
    self.logTextView.text = [self.logTextView.text stringByAppendingFormat:@"%@\n", message];
}

@end
