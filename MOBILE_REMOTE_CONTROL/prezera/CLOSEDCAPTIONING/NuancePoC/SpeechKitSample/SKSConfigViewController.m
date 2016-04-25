//
//  SKSConfigViewController.m
//  SpeechKitSample
//
//  Read-only screen to view configuration parameters set in SKSConfiguration.mm
//
//  Copyright (c) 2015 Nuance Communications. All rights reserved.
//

#import "SKSConfigViewController.h"
#import "SKSConfiguration.h"

@interface SKSConfigViewController ()

@end

@implementation SKSConfigViewController


- (void)viewDidLoad {
    [super viewDidLoad];
    
    [self.appId setText:SKSAppId];
    [self.appKey setText:SKSAppKey];
    [self.contextTag setText:SKSNLUContextTag];
    [self.serverHost setText:SKSServerHost];
    [self.serverPort setText:SKSServerPort];

    self.appIdHeight.constant = [self textViewHeight:self.appId];
    self.appKeyHeight.constant = [self textViewHeight:self.appKey];
    self.contextTagHeight.constant = [self textViewHeight:self.contextTag];
    self.serverHostHeight.constant = [self textViewHeight:self.serverHost];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (CGFloat) textViewHeight:(UITextView*) view
{
    [view sizeToFit];
    return view.frame.size.height;
}

@end
