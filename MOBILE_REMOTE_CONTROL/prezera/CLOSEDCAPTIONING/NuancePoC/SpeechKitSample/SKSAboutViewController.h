//
//  SKSAboutViewController.h
//  SpeechKitSample
//
//  Copyright (c) 2015 Nuance Communications. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface SKSAboutViewController : UIViewController
@property (weak, nonatomic) IBOutlet UITextView *versionTextView;
@property (weak, nonatomic) IBOutlet UITextView *urlTextView;
@property (weak, nonatomic) IBOutlet UITextView *emailTextView;
@property (weak, nonatomic) IBOutlet UITextView *componentTextView;

@end
