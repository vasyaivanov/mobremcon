//
//  SKSASRViewController.m
//  SpeechKitSample
//
//  This Controller is built to demonstrate how to perform ASR (Automatic Speech Recognition).
//
//  This Controller is very similar to SKSNLUViewController. Much of the code is duplicated for clarity.
//
//  ASR is the transformation of speech into text.
//
//  When performing speech recognition with SpeechKit, you have a variety of options. Here we demonstrate
//  Recognition Type (Language Model), Detection Type, and Language.
//
//  Modifying the Recognition Type will help optimize your ASR results. Built in types are Dictation,
//  Search, and TV. Your choice will depend on your application. Each type will better understand some
//  words and struggle with others.
//
//  Modifying the Detection Type will effect when the system thinks you are done speaking. Setting
//  this Long will allow your user to speak multiple sentences with short pauses in between. Setting
//  this to None will disable end of speech detection and will require you to tell the transaction
//  to stopRecording().
//
//  Languages can also be configured. Supported languages can be found here:
//  http://developer.nuance.com/public/index.php?task=supportedLanguages
//
//  Copyright (c) 2015 Nuance Communications. All rights reserved.
//

#import "SKSASRViewController.h"
#import "SKSConfiguration.h"
#import <SpeechKit/SpeechKit.h>

// State Logic: IDLE -> LISTENING -> PROCESSING -> repeat
enum {
    SKSIdle = 1,
    SKSListening = 2,
    SKSProcessing = 3
};
typedef NSUInteger SKSState;


@interface SKSASRViewController () <SKTransactionDelegate> {
    SKSession* _skSession;
    SKTransaction *_skTransaction;
    
    SKSState _state;
    
    NSTimer *_volumePollTimer;
}

@end

@implementation SKSASRViewController

@synthesize toggleRecogButton = _toggleRecogButton;
@synthesize language = _language;
@synthesize recognitionType = _recognitionType;
@synthesize endpointer = _endpointer;
@synthesize volumeLevelProgressView = _volumeLevelProgressView;

- (void)viewDidLoad
{
    [super viewDidLoad];
    
    _recognitionType = SKTransactionSpeechTypeDictation;
    _endpointer = SKTransactionEndOfSpeechDetectionShort;
    _language = LANGUAGE;
    [self.languageTextView setText:_language];
    
    _state = SKSIdle;
    _skTransaction = nil;
    
    // Create a session
    _skSession = [[SKSession alloc] initWithURL:[NSURL URLWithString:SKSServerUrl] appToken:SKSAppKey];

    if (!_skSession) {
        UIAlertView* alertView = [[UIAlertView alloc]initWithTitle:@"SpeechKit"
                                                           message:@"Failed to initialize SpeechKit session."
                                                          delegate:nil cancelButtonTitle:@"OK"
                                                 otherButtonTitles:nil, nil];
        [alertView show];
        return;
    }
    
    [self loadEarcons];
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

#pragma mark - ASR Actions

- (IBAction)toggleRecognition:(UIButton *)sender
{
    switch (_state) {
        case SKSIdle:
            [self recognize];
            break;
        case SKSListening:
            [self stopRecording];
            break;
        case SKSProcessing:
            [self cancel];
            break;
        default:
            break;
    }
}

- (void)recognize
{
    // Start listening to the user.
    [_toggleRecogButton setTitle:@"Stop" forState:UIControlStateNormal];

    _skTransaction = [_skSession recognizeWithType:self.recognitionType
                                            detection:self.endpointer
                                             language:self.language
                                             delegate:self];
}

- (void)stopRecording
{
    // Stop recording the user.
    [_skTransaction stopRecording];
    // Disable the button until we received notification that the transaction is completed.
    [_toggleRecogButton setEnabled:NO];
}

- (void)cancel
{
    // Cancel the Reco transaction.
    // This will only cancel if we have not received a response from the server yet.
    [_skTransaction cancel];
}

# pragma mark - SKTransactionDelegate

- (void)transactionDidBeginRecording:(SKTransaction *)transaction
{
    [self log:@"transactionDidBeginRecording"];
    
    _state = SKSListening;
    [self startPollingVolume];
    [_toggleRecogButton setTitle:@"Listening.." forState:UIControlStateNormal];
}

- (void)transactionDidFinishRecording:(SKTransaction *)transaction
{
    [self log:@"transactionDidFinishRecording"];
    
    _state = SKSProcessing;
    [self stopPollingVolume];
    [_toggleRecogButton setTitle:@"Processing.." forState:UIControlStateNormal];
}

- (void)transaction:(SKTransaction *)transaction didReceiveRecognition:(SKRecognition *)recognition
{
    [self log:[NSString stringWithFormat:@"didReceiveRecognition: %@", recognition.text]];
    
    _state = SKSIdle;
}

- (void)transaction:(SKTransaction *)transaction didReceiveServiceResponse:(NSDictionary *)response
{
    [self log:[NSString stringWithFormat:@"didReceiveServiceResponse: %@", response]];
}

- (void)transaction:(SKTransaction *)transaction didFinishWithSuggestion:(NSString *)suggestion
{
    [self log:@"didFinishWithSuggestion"];
    
    _state = SKSIdle;
    [self resetTransaction];
}

- (void)transaction:(SKTransaction *)transaction didFailWithError:(NSError *)error suggestion:(NSString *)suggestion
{
    [self log:[NSString stringWithFormat:@"didFailWithError: %@. %@", [error description], suggestion]];
    
    // Something went wrong. Ensure that your credentials are correct.
    // The user could also be offline, so be sure to handle this case appropriately.
    
    _state = SKSIdle;
    [self resetTransaction];
}

#pragma mark - Other Actions

- (void)touchesBegan:(NSSet *)touches withEvent:(UIEvent *)event {
    
    UITouch *touch = [[event allTouches] anyObject];
    if ([self.languageTextView isFirstResponder] && [touch view] != self.languageTextView) {
        [self.languageTextView resignFirstResponder];
    }
    [super touchesBegan:touches withEvent:event];
}

- (IBAction)selectRecognitionType:(UISegmentedControl *)sender
{
    NSInteger index = sender.selectedSegmentIndex;
    if(index == 0){
        _recognitionType = SKTransactionSpeechTypeDictation;
    } else if (index == 1){
        _recognitionType = SKTransactionSpeechTypeSearch;
    } else if (index == 2){
        _recognitionType = SKTransactionSpeechTypeTV;
    }
}

- (IBAction)selectEndpointerType:(UISegmentedControl *)sender
{
    NSInteger index = sender.selectedSegmentIndex;
    if(index == 0){
        _endpointer = SKTransactionEndOfSpeechDetectionLong;
    } else if (index == 1){
        _endpointer = SKTransactionEndOfSpeechDetectionShort;
    } else if (index == 2){
        _endpointer = SKTransactionEndOfSpeechDetectionNone;
    }
}

- (IBAction) useLanguage:(UITextField *)sender
{
    _language = sender.text;
}

- (IBAction)clearLogs:(UIButton *)sender
{
    self.logTextView.text = @"";
}

# pragma mark - Volume level

- (void)startPollingVolume
{
    // Every 50 milliseconds we should update the volume meter in our UI.
    _volumePollTimer = [NSTimer scheduledTimerWithTimeInterval:0.05
                                                        target:self
                                                      selector:@selector(pollVolume)
                                                      userInfo:nil repeats:YES];
}

- (void) pollVolume
{
    float volumeLevel = [_skTransaction audioLevel];
    [self.volumeLevelProgressView setProgress:volumeLevel/100.0];
}

- (void) stopPollingVolume
{
    [_volumePollTimer invalidate];
    _volumePollTimer = nil;
    [self.volumeLevelProgressView setProgress:0.f];
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
        [_toggleRecogButton setTitle:@"recognizeWithType" forState:UIControlStateNormal];
        [_toggleRecogButton setEnabled:YES];
    }];
}

- (void)loadEarcons
{
    // Load all of the earcons from disk
    
    NSString* startEarconPath = [[NSBundle mainBundle] pathForResource:@"sk_start" ofType:@"pcm"];
    NSString* stopEarconPath = [[NSBundle mainBundle] pathForResource:@"sk_stop" ofType:@"pcm"];
    NSString* errorEarconPath = [[NSBundle mainBundle] pathForResource:@"sk_error" ofType:@"pcm"];
    
    SKPCMFormat* audioFormat = [[SKPCMFormat alloc] init];
    audioFormat.sampleFormat = SKPCMSampleFormatSignedLinear16;
    audioFormat.sampleRate = 16000;
    audioFormat.channels = 1;
    
    // Attach them to the session
    
    _skSession.startEarcon = [[SKAudioFile alloc] initWithURL:[NSURL fileURLWithPath:startEarconPath] pcmFormat:audioFormat];
    _skSession.endEarcon = [[SKAudioFile alloc] initWithURL:[NSURL fileURLWithPath:stopEarconPath] pcmFormat:audioFormat];
    _skSession.errorEarcon = [[SKAudioFile alloc] initWithURL:[NSURL fileURLWithPath:errorEarconPath] pcmFormat:audioFormat];
}

@end
