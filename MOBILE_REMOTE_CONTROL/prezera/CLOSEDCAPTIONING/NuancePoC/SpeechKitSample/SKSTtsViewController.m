//
//  SKSTTSViewController.m
//  SpeechKitSample
//
//  This Controller is built to demonstrate how to perform TTS.
//
//  TTS is the transformation of text into speech.
//
//  When performing speech synthesis with SpeechKit, you have a variety of options. Here we demonstrate
//  Language. But you can also specify the Voice. If you do not, then the default voice will be used
//  for the given language.
//
//  Supported languages and voices can be found here:
//  http://dragonmobile.nuancemobiledeveloper.com/public/index.php?task=supportedLanguages
//
//  Copyright (c) 2015 Nuance Communications. All rights reserved.
//

#import "SKSTTSViewController.h"
#import "SKSConfiguration.h"
#import <SpeechKit/SpeechKit.h>

@interface SKSTTSViewController () <SKTransactionDelegate, SKAudioPlayerDelegate> {
    SKSession* _skSession;
    SKTransaction *_skTransaction;
}

- (void)resetTransaction;

@end

@implementation SKSTTSViewController

@synthesize toggleTtsButton;
@synthesize language;
@synthesize languageTextView;

- (void)viewDidLoad
{
    [super viewDidLoad];
    // Do any additional setup after loading the view.
    
    _skTransaction = nil;
    self.language = LANGUAGE;
    self.languageTextView.text = self.language;
    
    _skSession = [[SKSession alloc] initWithURL:[NSURL URLWithString:SKSServerUrl] appToken:SKSAppKey];
    
    if (!_skSession) {
        UIAlertView* alertView = [[UIAlertView alloc]initWithTitle:@"SpeechKit"
                                                           message:@"Failed to initialize SpeechKit session."
                                                          delegate:nil cancelButtonTitle:@"OK"
                                                 otherButtonTitles:nil, nil];
        [alertView show];
    }
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)textFieldDidEndEditing:(UITextField *)textField {
    [textField resignFirstResponder];
}

- (BOOL)textFieldShouldReturn:(UITextField *)textField {
    [textField resignFirstResponder];
    return YES;
}

- (void)textViewDidEndEditing:(UITextView *)textView {
    [textView resignFirstResponder];
}

#pragma mark - TTS Transactions

- (IBAction)toggleTts:(UIButton *)sender {
    if (!_skTransaction) {
        // Start a TTS transaction
        _skTransaction = [_skSession speakString:self.ttsTextView.text
                                    withLanguage:self.language
                                        delegate:self];
        
        [toggleTtsButton setTitle:@"cancel" forState:UIControlStateNormal];
    } else {
        // Cancel the TTS transaction
        [_skTransaction cancel];
        
        [self resetTransaction];
    }
}

#pragma mark - SKTransactionDelegate

- (void)transaction:(SKTransaction *)transaction didReceiveAudio:(SKAudio *)audio
{
    [self log:@"didReceiveAudio"];
    
    [self resetTransaction];
}

- (void)transaction:(SKTransaction *)transaction didFinishWithSuggestion:(NSString *)suggestion
{
    [self log:@"didFinishWithSuggestion"];
    
    // Notification of a successful transaction. Nothing to do here.
}

- (void)transaction:(SKTransaction *)transaction didFailWithError:(NSError *)error suggestion:(NSString *)suggestion
{
    [self log:[NSString stringWithFormat:@"didFailWithError: %@. %@", [error description], suggestion]];
    
    // Something went wrong. Check Configuration.mm to ensure that your settings are correct.
    // The user could also be offline, so be sure to handle this case appropriately.
    
    [self resetTransaction];
}

#pragma mark - SKAudioPlayerDelegate

- (void)audioPlayer:(SKAudioPlayer *)player willBeginPlaying:(SKAudio *)audio
{
    [self log:@"willBeginPlaying"];
    
    // The TTS Audio will begin playing.
}

- (void)audioPlayer:(SKAudioPlayer *)player didFinishPlaying:(SKAudio *)audio
{
    [self log:@"didFinishPlaying"];
    
    // The TTS Audio has finished playing.
}



#pragma mark - Other Actions

- (void)touchesBegan:(NSSet *)touches withEvent:(UIEvent *)event {
    
    UITouch *touch = [[event allTouches] anyObject];
    if ([self.ttsTextView isFirstResponder] && [touch view] != self.ttsTextView) {
        [self.ttsTextView resignFirstResponder];
    }
    else if ([self.languageTextView isFirstResponder] && [touch view] != self.languageTextView) {
        [self.languageTextView resignFirstResponder];
    }
    [super touchesBegan:touches withEvent:event];
}

- (IBAction)clearLogs:(UIButton *)sender {
    self.logTextView.text = @"";
}

- (IBAction)useLanguage:(UITextField *)sender
{
    self.language = sender.text;
}

#pragma mark - Helpers


- (void)log:(NSString *)message
{
    self.logTextView.text = [self.logTextView.text stringByAppendingFormat:@"%@\n", message];
}

- (void)resetTransaction
{
    [[NSOperationQueue mainQueue] addOperationWithBlock:^{
        _skTransaction = nil;
        [toggleTtsButton setTitle:@"speakString" forState:UIControlStateNormal];
    }];
}


@end
