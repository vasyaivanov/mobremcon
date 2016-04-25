//
//  SKSAudioViewController.h
//  SpeechKitSample
//
//  Copyright (c) 2015 Nuance Communications. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface SKSAudioViewController : UIViewController

@property (weak, nonatomic) IBOutlet UIButton *toggleAudioButton;
@property (weak, nonatomic) IBOutlet UITextView *logTextView;
@property (weak, nonatomic) IBOutlet UIButton *clearLogsButton;
@property (weak, nonatomic) IBOutlet UIStepper *repetitionStepper;
@property (weak, nonatomic) IBOutlet UITextField *repetitionText;

@end