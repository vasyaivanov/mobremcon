//
//  OpenEarsPlugin.m
//  RemoteControl
//
//  Created by Mikhail Arov on 7/14/14.
//
//

#import "OpenEarsPlugin.h"
#import <OpenEars/LanguageModelGenerator.h>

@implementation OpenEarsPlugin
@synthesize pocketsphinxController;
@synthesize openEarsEventsObserver;
@synthesize delegate;

#pragma mark -
#pragma mark Memory Management

- (void)dealloc {
	openEarsEventsObserver.delegate = nil;
    [self.pocketsphinxController stopListening];
    [super dealloc];
}

#pragma mark -
#pragma mark Lazy Allocation

- (PocketsphinxController *)pocketsphinxController {
	if (pocketsphinxController == nil) {
		pocketsphinxController = [[PocketsphinxController alloc] init];
	}
	return pocketsphinxController;
}

- (OpenEarsEventsObserver *)openEarsEventsObserver {
	if (openEarsEventsObserver == nil) {
		openEarsEventsObserver = [[OpenEarsEventsObserver alloc] init];
	}
	return openEarsEventsObserver;
}

#pragma mark -
#pragma mark Methods to set up speech recognition

- (id) init {
    
    LanguageModelGenerator *lmGenerator = [[LanguageModelGenerator alloc] init];

  
    NSArray *words = [NSArray arrayWithObjects:@"NEXT", @"PREVIOUS", @"FIRST", @"LAST", @"SLIDE", nil];
    NSString *name = @"SlideNavigation";
    NSError *err = [lmGenerator generateLanguageModelFromArray:words withFilesNamed:name forAcousticModelAtPath:[AcousticModel pathToModel:@"AcousticModelEnglish"]]; // Change "AcousticModelEnglish" to "AcousticModelSpanish" to create a Spanish language model instead of an English one.
	

	
/*	NSString *myCorpus = [[NSBundle mainBundle] pathForResource:@"corpus" ofType:@"txt"];
NSString *name = @"NameIWantForMyLanguageModelFiles";
NSError *err = [lmGenerator generateLanguageModelFromTextFile:myCorpus withFilesNamed:name forAcousticModelAtPath:[AcousticModel pathToModel:@"AcousticModelEnglish"]];


	NSString *lmPath = [[NSBundle mainBundle] pathForResource:@"NameIWantForMyLanguageModelFiles" ofType:@"arpa"];
NSString *dicPath = [[NSBundle mainBundle] pathForResource:@"NameIWantForMyLanguageModelFiles" ofType:@"dic"];
[self.pocketsphinxController startListeningWithLanguageModelAtPath:lmPath dictionaryAtPath:dicPath acousticModelAtPath:[AcousticModel pathToModel:@"AcousticModelEnglish"] languageModelIsJSGF:NO];
*/
	
    
    NSDictionary *languageGeneratorResults = nil;
	
    if([err code] == noErr) {
        
        languageGeneratorResults = [err userInfo];
        
        self.pathToLanguageModel = [languageGeneratorResults objectForKey:@"LMPath"];
        self.pathToDictionary = [languageGeneratorResults objectForKey:@"DictionaryPath"];
        
    } else {
        NSLog(@"Error: %@",[err localizedDescription]);
    }
    [OpenEarsLogging startOpenEarsLogging];
    [self.openEarsEventsObserver setDelegate:self]; // Make this class the delegate of OpenEarsObserver so we can get all of the messages about what OpenEars is doing.
    
    self = [super init];
    return self;
}

- (void) startListening {
    
    [self.pocketsphinxController startListeningWithLanguageModelAtPath:self.pathToLanguageModel dictionaryAtPath:self.pathToDictionary acousticModelAtPath:[AcousticModel pathToModel:@"AcousticModelEnglish"] languageModelIsJSGF:FALSE]; // Change "AcousticModelEnglish" to "AcousticModelSpanish" in order to perform Spanish recognition instead of English.
    
}

#pragma mark -
#pragma mark OpenEarsEventsObserver delegate methods


- (void) pocketsphinxDidReceiveHypothesis:(NSString *)hypothesis recognitionScore:(NSString *)recognitionScore utteranceID:(NSString *)utteranceID {
	NSLog(@"The received hypothesis is %@ with a score of %@ and an ID of %@", hypothesis, recognitionScore, utteranceID);
    [delegate getResult:hypothesis];
}

- (void) pocketsphinxDidStartCalibration {
	NSLog(@"Pocketsphinx calibration has started.");
}

- (void) pocketsphinxDidCompleteCalibration {
	NSLog(@"Pocketsphinx calibration is complete.");
}

- (void) pocketsphinxDidStartListening {
	NSLog(@"Pocketsphinx is now listening.");
}

- (void) pocketsphinxDidDetectSpeech {
	NSLog(@"Pocketsphinx has detected speech.");
}

- (void) pocketsphinxDidDetectFinishedSpeech {
	NSLog(@"Pocketsphinx has detected a period of silence, concluding an utterance.");
}

- (void) pocketsphinxDidStopListening {
	NSLog(@"Pocketsphinx has stopped listening.");
}

- (void) pocketsphinxDidSuspendRecognition {
	NSLog(@"Pocketsphinx has suspended recognition.");
}

- (void) pocketsphinxDidResumeRecognition {
	NSLog(@"Pocketsphinx has resumed recognition.");
}

- (void) pocketsphinxDidChangeLanguageModelToFile:(NSString *)newLanguageModelPathAsString andDictionary:(NSString *)newDictionaryPathAsString {
	NSLog(@"Pocketsphinx is now using the following language model: \n%@ and the following dictionary: %@",newLanguageModelPathAsString,newDictionaryPathAsString);
}

- (void) pocketSphinxContinuousSetupDidFail { // This can let you know that something went wrong with the recognition loop startup. Turn on OPENEARSLOGGING to learn why.
	NSLog(@"Setting up the continuous recognition loop has failed for some reason, please turn on OpenEarsLogging to learn more.");
}
- (void) testRecognitionCompleted {
	NSLog(@"A test file that was submitted for recognition is now complete.");
}

// An optional delegate method of OpenEarsEventsObserver which informs that there was an interruption to the audio session (e.g. an incoming phone call).
- (void) audioSessionInterruptionDidBegin {
	NSLog(@"AudioSession interruption began."); // Log it.
	[self.pocketsphinxController stopListening]; // React to it by telling Pocketsphinx to stop listening since it will need to restart its loop after an interruption.
}

// An optional delegate method of OpenEarsEventsObserver which informs that the interruption to the audio session ended.
- (void) audioSessionInterruptionDidEnd {
	NSLog(@"AudioSession interruption ended."); // Log it.
    // We're restarting the previously-stopped listening loop.
    [self startListening];
	
}

// An optional delegate method of OpenEarsEventsObserver which informs that the audio input became unavailable.
- (void) audioInputDidBecomeUnavailable {
	NSLog(@"The audio input has become unavailable"); // Log it.
	[self.pocketsphinxController stopListening]; // React to it by telling Pocketsphinx to stop listening since there is no available input
}

// An optional delegate method of OpenEarsEventsObserver which informs that the unavailable audio input became available again.
- (void) audioInputDidBecomeAvailable {
	NSLog(@"The audio input is available"); // Log it.
    [self startListening];
}

@end
