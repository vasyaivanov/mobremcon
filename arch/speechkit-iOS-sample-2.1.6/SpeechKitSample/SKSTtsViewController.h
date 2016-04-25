//
//  SKSTTSViewController.h
//  SpeechKitSample
//
//  Copyright (c) 2015 Nuance Communications. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface SKSTTSViewController : UIViewController<UITextFieldDelegate, UITextViewDelegate>

@property (weak, nonatomic) IBOutlet UITextView *ttsTextView;
@property (weak, nonatomic) IBOutlet UITextView *logTextView;
@property (weak, nonatomic) IBOutlet UIButton *toggleTtsButton;
@property (weak, nonatomic) IBOutlet UIButton *clearLogsButton;
@property (weak, nonatomic) IBOutlet UITextField *languageTextView;

@property (strong, nonatomic) NSString *language;

- (IBAction) useLanguage:(UITextField *)sender;

@end
