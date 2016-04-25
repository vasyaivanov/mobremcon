//
//  SKSTextNLUViewController.m
//  SpeechKitSample
//
//  This Controller is built to demonstrate how to perform NLU (Natural Language
//  Understanding) with text input instead of voice.
// 
//  This Controller is very similar to SKSNLUViewController. Much of the code is duplicated
//  for clarity.
// 
//  NLU is the transformation of text into meaning.
// 
//  When performing speech recognition with SpeechKit, you have a variety of options. Here we
//  demonstrate Model ID and Language.
// 
//  The Context Tag is assigned in the system configuration upon deployment of an NLU model.
//  Combined with the App ID, it will be used to find the correct NLU version to query.
//
//  Languages can be configured. Supported languages can be found here:
//  http://developer.nuance.com/public/index.php?task=supportedLanguages
//
//  Copyright (c) 2015 Nuance Communications. All rights reserved.
//

#import "SKSTextNLUViewController.h"
#import "SKSConfiguration.h"
#import <AVFoundation/AVFoundation.h>
#import <SpeechKit/SpeechKit.h>

// State Logic: IDLE -> PROCESSING -> repeat
enum {
    SKSIdle = 1,
    SKSProcessing = 2
};
typedef NSUInteger SKSState;


@interface SKSTextNLUViewController () <SKTransactionDelegate> {
    SKSession* _skSession;
    SKTransaction *_skTransaction;
    SKSState _state;
    NSString* _textInput;
}

@end

@implementation SKSTextNLUViewController

- (void)viewDidLoad
{
    [super viewDidLoad];
    
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

#pragma mark - Reco Actions

- (IBAction)toggleRecognition:(UIButton *)sender
{
    switch (_state) {
        case SKSIdle:
            [self recognize];
            break;
        default:
            break;
    }
}

- (void)recognize
{
    // Start listening to the user.
    [_toggleRecogButton setTitle:@"Stop" forState:UIControlStateNormal];
    
    // Set appserver data
    NSArray* keys = [NSArray arrayWithObjects:@"text", @"message", nil];
    NSArray* objects = [NSArray arrayWithObjects:_textInput, _textInput, nil];
    NSDictionary* data = [NSDictionary dictionaryWithObjects:objects forKeys:keys];
    
    // Make the transaction
    _skTransaction = [_skSession transactionWithService:_contextTag
                              language:_language
                                  data:data
                              delegate:self];
}

# pragma mark - SKTransactionDelegate

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

- (void)touchesBegan:(NSSet *)touches withEvent:(UIEvent *)event
{
    
    UITouch *touch = [[event allTouches] anyObject];
    if ([self.languageTextView isFirstResponder] && [touch view] != self.languageTextView) {
        [self.languageTextView resignFirstResponder];
    }
    else if ([self.contextTagTextView isFirstResponder] && [touch view] != self.contextTagTextView) {
        [self.contextTagTextView resignFirstResponder];
    }
    [super touchesBegan:touches withEvent:event];
}

- (IBAction) useNLUModel:(UITextField *)sender
{
    _contextTag = sender.text;
}

- (IBAction) useLanguage:(UITextField *)sender
{
    _language = sender.text;
}

- (IBAction) useTextInput:(UITextField *)sender
{
    _textInput = sender.text;
}

- (IBAction)clearLogs:(UIButton *)sender
{
    self.logTextView.text = @"";
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
        [_toggleRecogButton setTitle:@"transactionWithService" forState:UIControlStateNormal];
        [_toggleRecogButton setEnabled:YES];
    }];
}

@end
