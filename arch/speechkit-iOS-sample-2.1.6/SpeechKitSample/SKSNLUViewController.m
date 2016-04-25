//
//  SKSNLUViewController.m
//  SpeechKitSample
//
//  This Controller is built to demonstrate how to perform NLU (Natural Language Understanding).
// 
//  This Controller is very similar to SKSASRViewController. Much of the code is duplicated for clarity.
// 
//  NLU is the transformation of text into meaning.
// 
//  When performing speech recognition with SpeechKit, you have a variety of options. Here we demonstrate
//  Detection Type and Language.
//
//  The Context Tag is assigned in the system configuration upon deployment of an NLU model.
//  Combined with the App ID, it will be used to find the correct NLU version to query.
// 
//  Languages can also be configured. Supported languages can be found here:
//  http://dragonmobile.nuancemobiledeveloper.com/public/index.php?task=supportedLanguages
//
//  Copyright (c) 2015 Nuance Communications. All rights reserved.
//

#import "SKSNLUViewController.h"
#import "SKSConfiguration.h"
#import <SpeechKit/SpeechKit.h>

// State Logic: IDLE -> LISTENING -> PROCESSING -> repeat
enum {
    SKSIdle = 1,
    SKSListening = 2,
    SKSProcessing = 3
};
typedef NSUInteger SKSState;


@interface SKSNLUViewController () <SKTransactionDelegate> {
    SKSession* _skSession;
    SKTransaction *_skTransaction;
    
    SKSState _state;
    
    NSTimer *_volumePollTimer;
}

@end

@implementation SKSNLUViewController

@synthesize toggleRecogButton = _toggleRecogButton;
@synthesize contextTag = _contextTag;
@synthesize language = _language;
@synthesize endpointer = _endpointer;
@synthesize volumeLevelProgressView = _volumeLevelProgressView;

- (void)viewDidLoad
{
    [super viewDidLoad];
    
    _endpointer = SKTransactionEndOfSpeechDetectionShort;
    _language = LANGUAGE;
    [self.languageTextView setText:_language];
    _contextTag = SKSNLUContextTag;
    [self.contextTagTextView setText:_contextTag];
    
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
    _skTransaction = [_skSession recognizeWithService:_contextTag
                                            detection:self.endpointer
                                             language:self.language
                                                 data:nil
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
    [self log:[NSString stringWithFormat:@"didReceiveServiceResponse: %@", [response description]]];
    
    _state = SKSIdle;
    [self resetTransaction];
}

- (void)transaction:(SKTransaction *)transaction didReceiveInterpretation:(SKInterpretation *)interpretation
{
    [self log:[NSString stringWithFormat:@"didReceiveInterpretation: %@", interpretation.result]];
    
    _state = SKSIdle;
    [self resetTransaction];
}

- (void)transaction:(SKTransaction *)transaction didFinishWithSuggestion:(NSString *)suggestion
{
    [self log:@"didFinishWithSuggestion"];
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
    else if ([self.contextTagTextView isFirstResponder] && [touch view] != self.contextTagTextView) {
        [self.contextTagTextView resignFirstResponder];
    }
    [super touchesBegan:touches withEvent:event];
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
- (IBAction)useNLUModel:(UITextField *)sender {
    _contextTag = sender.text;
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
        [_toggleRecogButton setTitle:@"recognizeWithService" forState:UIControlStateNormal];
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
