//
//  SKSAboutViewController.m
//  SpeechKitSample
//
//  Screen to display extra info about SpeechKit.
//
//  Copyright (c) 2015 Nuance Communications. All rights reserved.
//

#import "SKSAboutViewController.h"

@interface SKSAboutViewController ()

@end

@implementation SKSAboutViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    
    NSString *appVersionFromConfig = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"AppVersion"];
    NSString *appVersion = [NSString stringWithFormat:@"SpeechKit SampleApp v%@", appVersionFromConfig];
    
    [self.versionTextView setText:appVersion];

    NSString *urlHtml = @"<a>http://developer.nuance.com</a>";
    
    [self.urlTextView setAttributedText:[self textToHtml:urlHtml]];
    
    NSString *emailHtml = @"<a>developerrelations@nuance.com</a>";
    
    [self.emailTextView setAttributedText:[self textToHtml:emailHtml]];
    
    NSString *sdkVersionFromConfig = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"SdkVersion"];
    NSString *sdkVersion = [NSString stringWithFormat:@"SpeechKit SDK %@", sdkVersionFromConfig];
    
    [self.componentTextView setText:sdkVersion];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (NSAttributedString*)textToHtml:(NSString*)text
{
    NSAttributedString *attributedString = [[NSAttributedString alloc] initWithData:[text dataUsingEncoding:NSUnicodeStringEncoding] options:@{ NSDocumentTypeDocumentAttribute: NSHTMLTextDocumentType } documentAttributes:nil error:nil];
    return attributedString;
}

@end
