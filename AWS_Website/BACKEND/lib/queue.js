var DEBUG = false;

var Queue = function(maxQueueLength) {
	// initialise the queue and offset
  	this.queue  = [];
  	this.offset = 0;
    this.isRunning = false;
    this.maxQueueLength = maxQueueLength; // TODO
  	
  	// a class storing all the data for a queue item
  	var QueueItem = function(slite, convertJob, priority){
  		this.slite = slite;
  		this.convertJob = convertJob;
  		this.priority = priority || 0;
  		this.timeStamp = new Date();//.now();

  		this.getSlite = function() {
  			return this.slite;
  		};

      this.getConvertJob = function () {
  			return this.convertJob;
  		}

  		this.getPriority = function () {
  			return this.priority;
  		};
 
 		  this.getTimeStamp = function () {
  		  return this.timeStamp;
      };
   	};

  	// Returns the length of the queue.
  	this.getLength = function() {
    	return (this.queue.length - this.offset);
  	};

  	// Returns true if the queue is empty, and false otherwise.
  	this.isEmpty = function() {
    	return (this.queue.length === 0);
  	};

  	/* Enqueues the specified item. The parameter is:
   	 *
     * item - the item to enqueue
     */
  	this.enqueue = function(item) {
    	this.queue.push(item);
  	};

  	/* Dequeues an item and returns it. If the queue is empty, the value
     * 'undefined' is returned.
     */
  	this.dequeue = function(){
    	// if the queue is empty, return immediately
    	if (this.queue.length == 0) {
    		return undefined;
    	}

    	// store the item at the front of the queue
    	var item = this.queue[this.offset];

    	// increment the offset and remove the free space if necessary
    	if (++ this.offset * 2 >= this.queue.length) {
      		this.queue  = this.queue.slice(this.offset);
      		this.offset = 0;
    	}

    	// return the dequeued item
    	return item;
 	};

  	/* Returns the item at the front of the queue (without dequeuing it). If the
  	 * queue is empty then undefined is returned.
   	 */
  	this.peek = function(){
    	return (this.queue.length > 0 ? this.queue[this.offset] : undefined);
 	};


 	// adds a slide to the queue to convert it and start execution if the queue is empty
 	this.add = function(slite, convertJob, priority, onQueueCompleteCallback) {
 		var item = new QueueItem(slite, convertJob, priority);
		this.enqueue(item);
		console.log("QUEUE Item added: " + slite.getUploadFullFileName() + " at " + item.getTimeStamp() + ' priority: ' + item.getPriority());
 		if(!this.isRunning) {
      if(DEBUG) {console.log("Starting the QUEUE");}
			this.exec(function(err){
				if(err) {
					console.error(err + " while executing the queue");
				} else {
					console.log('Finished executing the queque');					
        }
        onQueueCompleteCallback && onQueueCompleteCallback(err);
			}); 			
 		}
	};

	this.queueIsRunning = function () {
		return this.isRunning;
	};

	this.exec = function(onQueueCompleteCallback) {
    var self = this;
		if(this.isEmpty()) {
		  this.isRunning = false;
      if(DEBUG) {console.log("Running the QUEUE is complete, calling onQueueCompleteCallback ...");}
      onQueueCompleteCallback && onQueueCompleteCallback(null);	// stop executing because the queue is empty
			return;
		}
		this.isRunning = true;
		var item = this.dequeue();
		var slite = item.getSlite();
    var convertJob = item.getConvertJob();
    console.log("QUEUE Item Popped: " + slite.getUploadFullFileName());
    if(DEBUG) {
      console.log("ITEM: ")
      console.log(item);
      console.log("Starting a convertJob: ");
    }
    convertJob(null, slite, function () {
        // start the job`s callback and after some time recursively call the function itself when the callback is finished
        setTimeout(function () {
        // only one of the two callbacks below can be used to recursively add new items to the queue
            slite.getParams().onSliteCompleteCallback && slite.getParams().onSliteCompleteCallback();
            setTimeout(function () {
              self.exec(onQueueCompleteCallback);
            }, 5); // to allow recursion and some time gap between conversions
        }, 1); // to allow recursion 
    }); 
	};

	console.log("QUEUE created");
}

module.exports.Queue = Queue;