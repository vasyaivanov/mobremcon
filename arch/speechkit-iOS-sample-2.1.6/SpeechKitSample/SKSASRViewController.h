//
//  SKSASRViewController.h
//  SpeechKitSample
//
//  Copyright (c) 2015 Nuance Communications. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <SpeechKit/SKTransaction.h>

@interface SKSASRViewController : UIViewController<UITextFieldDelegate>

// User interface
@property (weak, nonatomic) IBOutlet UIButton *toggleRecogButton;
@property (weak, nonatomic) IBOutlet UITextView *logTextView;
@property (weak, nonatomic) IBOutlet UIButton *clearLogsButton;
@property (weak, nonatomic) IBOutlet UISegmentedControl *recognitionTypeSegmentControl;
@property (weak, nonatomic) IBOutlet UISegmentedControl *endpointerTypeSegmentControl;
@property (weak, nonatomic) IBOutlet UIProgressView *volumeLevelProgressView;
@property (weak, nonatomic) IBOutlet UITextField *languageTextView;

// Settings
@property (strong, nonatomic) NSString *language;
@property (strong, nonatomic) NSString *recognitionType;
@property (assign, nonatomic) SKTransactionEndOfSpeechDetection endpointer;

@end