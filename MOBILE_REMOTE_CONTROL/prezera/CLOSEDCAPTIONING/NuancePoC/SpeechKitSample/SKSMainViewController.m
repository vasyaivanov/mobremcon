//
//  SKSMainViewController.m
//  SpeechKitSample
//
//  Initial screen.
//
//  Copyright (c) 2015 Nuance Communications. All rights reserved.
//

#import "SKSMainViewController.h"
#import <AVFoundation/AVFoundation.h>

@interface SKSMainViewController () {
    NSArray* _actionItems;
}

@end

@implementation SKSMainViewController

- (void)viewDidLoad
{
    [super viewDidLoad];
	// Do any additional setup after loading the view, typically from a nib.
    
    _actionItems = @[
         @{@"title":@"Core technologies",
           @"values":@[
                    @[@"Speech Recognition", @"Cloud based ASR", @"SegueRecog"],
                    @[@"Speech and Natural Language", @"Cloud based ASR with NLU", @"SegueNLU"],
                    @[@"Text and Natural Language", @"Cloud based NLU (text input)", @"SegueTextNLU"],
                    @[@"Speech Synthesis", @"Cloud based TTS", @"SegueTts"]
                    ]
           },
         @{@"title":@"Utilities",
           @"values": @[
                   @[@"Audio Playback", @"Loading and playing a resource", @"SegueAudio"]
                   ]
           },
         @{@"title":@"Miscellaneous",
           @"values": @[
                   @[@"Configuration", @"Host URL, App ID, etc", @"SegueConfig"],
                   @[@"About", @"Learn more about SpeechKit", @"SegueAbout"]
                   ]
           }
     ];
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

/*
 * UITableViewDataSource
 */

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
    return [[_actionItems objectAtIndex:section][@"values"] count];
}

- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView
{
    return [_actionItems count];
}

- (NSString *)tableView:(UITableView *)tableView titleForHeaderInSection:(NSInteger)section
{
    return _actionItems[section][@"title"];
}

// Row display. Implementers should *always* try to reuse cells by setting each cell's reuseIdentifier and querying for available reusable cells with dequeueReusableCellWithIdentifier:
// Cell gets various attributes set automatically based on table (separators) and data source (accessory views, editing controls)

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    static NSString* cellIdentifier = @"SkActionCell";
    
    UITableViewCell* cell = [tableView dequeueReusableCellWithIdentifier:cellIdentifier];
    if (cell == nil) {
        cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleSubtitle reuseIdentifier:cellIdentifier];
    }
    
    NSArray* item = [[_actionItems objectAtIndex:indexPath.section][@"values"] objectAtIndex:indexPath.row];
    cell.textLabel.text = item[0];
    [cell.detailTextLabel setText:item[1]];
    return cell;
}

/*
 * UITableViewDelegate
 */

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath
{
    NSArray* item = [[_actionItems objectAtIndex:indexPath.section][@"values"] objectAtIndex:indexPath.row];
    [self performSegueWithIdentifier:item[2] sender:self];
}

@end
