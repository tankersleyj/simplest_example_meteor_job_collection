import { Meteor } from 'meteor/meteor';
import Future from 'fibers/future';
waitQueue = JobCollection('waitQueue');

Meteor.startup(function(){
  waitQueue.startJobServer();

  waitQueue.processJobs( // TODO: shouldn't this run in startup?
    // Type of job to request
    // Can also be an array of job types
    'wait',
    {
      pollInterval: 1*1000, // Poll every 1 second
    },
    function (job, callback) {
      // ##### THIS IS WHERE THE WORK GETS DONE #####//
      console.log("job process triggered");
      // Only called when there is a valid job

      //job.data is a data object the developer can pass when submitting up a new job.
      console.log( job.data );
      Meteor.call('longWait', 5000, function(error, res){
        console.log("longWait Method callback");

        if (res) {
          console.log(res);
          job.done(); // Only mark the job done if we have a response
        }
        if (error) {
          console.log(error);
          job.cancel();
        }
      });

      callback(); // TODO: what is this? Can the dev modify this?
    }
  );

});



Meteor.methods({
  longWaitSubmit:function(){
    console.log('Sumbitting test job "Echo" ');

    var newEchoJob = new Job(waitQueue, //the job collection to use
      'wait', // type of job
      // A data object that will be made available to the job worker. See 'job.data' above
      {
        message: 'Hello, is there anybody in here?'
      }
    );

    // submit the job, will set the status to 'waiting'.
    newEchoJob.save();

    return
  },
  longWait: function(milliseconds){

    var fut = new Future();

    Meteor.setTimeout(function(){
      console.log("This is the timeout action");

       fut['return']("Delayed :" + milliseconds + "ms");

      // return "waiting " + milliseconds + "ms to return"
    }, milliseconds);

    return fut.wait();
  }
});
