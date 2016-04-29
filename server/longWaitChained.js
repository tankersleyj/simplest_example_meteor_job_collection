import { Meteor } from 'meteor/meteor';
import Future from 'fibers/future';
waitQueueChained = JobCollection('waitQueueChained');

Meteor.startup(function(){
  waitQueueChained.startJobServer();

  waitQueueChained.processJobs(
    // Type of job to request
    // Can also be an array of job types
    'theWaitingTask',
    {
      pollInterval: 1*1000, // Poll every 1 second
    },
    function (job, callback) {
      // ##### THIS IS WHERE THE WORK GETS DONE #####//
      console.log("Job worker started, with .processJobs() ");
      // Only called when there is a valid job

      //Run a meteor method as the task.

      Meteor.call('chainedFunction', function(error, res){
        console.log("Method callback");
        if (res) {
          console.log(res);
          //job.data is a data object the developer can pass when submitting up a new job.
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
  triggerLongWaitChainedTask:function(){
    console.log('Sumbitting task type "callLongWaitTask" ');

    Job(waitQueueChained, //the job collection to use
      'theWaitingTask', // type of job
      {} //job data
    ).save();// submit the job to status: "ready"

    return
  },
  chainedFunction:function(){
    //just an intermediary wrapper between the other slow function.
    Meteor.call('reallyLongWait');

    return
  },
  reallyLongWait: function(){
    console.log("Called Meteor method 'longWait'. This will take some time to completed." );
    var milliseconds = 30000
    var fut = new Future();

    //let's pretend the work takes 'milliseconds' time to complete.
    Meteor.setTimeout(function(){
       fut.return("The job completed after: " + milliseconds + "ms");
      // return "waiting " + milliseconds + "ms to return"
    }, milliseconds);

    return fut.wait();
  }
});
