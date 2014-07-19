//
//  OpenEarsPlugin.h
//  RemoteControl
//
//  Created by Mikhail Arov on 7/14/14.
//
//

#import <OpenEars/PocketsphinxController.h>
#import <OpenEars/OpenEarsEventsObserver.h> // We need to import this here in order to use the delegate.
#import <OpenEars/OpenEarsLogging.h>
#import <OpenEars/AcousticModel.h>

@protocol OpenEarsPluginDelegate
@required
- (void) getResult:(NSString*)resultText;
@end

@interface OpenEarsPlugin : NSObject<OpenEarsEventsObserverDelegate>{
    PocketsphinxController *pocketsphinxController; // The controller for Pocketsphinx (voice recognition).
	OpenEarsEventsObserver *openEarsEventsObserver; // A class whose delegate methods which will allow us to stay informed of changes in the Pocketsphinx statuses.
}

@property (nonatomic,strong) id delegate;

@property (nonatomic, strong) OpenEarsEventsObserver *openEarsEventsObserver;
@property (nonatomic, strong) PocketsphinxController *pocketsphinxController;

@property (nonatomic, copy) NSString *pathToLanguageModel;
@property (nonatomic, copy) NSString *pathToDictionary;

- (void) startListening;

@end
