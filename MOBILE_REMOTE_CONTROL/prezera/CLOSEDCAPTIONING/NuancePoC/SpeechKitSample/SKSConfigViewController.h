//
//  SKSConfigViewController.h
//  SpeechKitSample
//
//  Copyright (c) 2015 Nuance Communications. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface SKSConfigViewController : UIViewController

@property (weak, nonatomic) IBOutlet UITextView *appId;
@property (weak, nonatomic) IBOutlet UITextView *appKey;
@property (weak, nonatomic) IBOutlet UITextView *contextTag;
@property (weak, nonatomic) IBOutlet UITextView *serverHost;
@property (weak, nonatomic) IBOutlet UITextView *serverPort;

@property (weak, nonatomic) IBOutlet NSLayoutConstraint *appIdHeight;
@property (weak, nonatomic) IBOutlet NSLayoutConstraint *appKeyHeight;
@property (weak, nonatomic) IBOutlet NSLayoutConstraint *contextTagHeight;
@property (weak, nonatomic) IBOutlet NSLayoutConstraint *serverHostHeight;

@end
