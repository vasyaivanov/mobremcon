//
//  SKSTextNLUViewController.h
//  SpeechKitSample
//
//  Copyright (c) 2015 Nuance Communications. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <SpeechKit/SKTransaction.h>

@interface SKSTextNLUViewController : UIViewController<UITextFieldDelegate>

// User interface
@property (weak, nonatomic) IBOutlet UIButton *toggleRecogButton;
@property (weak, nonatomic) IBOutlet UITextView *logTextView;
@property (weak, nonatomic) IBOutlet UIButton *clearLogsButton;

@property (weak, nonatomic) IBOutlet UITextField *contextTagTextView;
@property (weak, nonatomic) IBOutlet UITextField *languageTextView;
@property (weak, nonatomic) IBOutlet UITextField *textInputTextView;

// Settings
@property (strong, nonatomic) NSString *contextTag;
@property (strong, nonatomic) NSString *language;

@end
