import { Meteor } from 'meteor/meteor';
import Future from 'fibers/future';
waitQueue = JobCollection('waitQueue');

Meteor.startup(function(){
  waitQueue.startJobServer();

  waitQueue.processJobs(
    // Type of job to request
    // Can also be an array of job types
    'callLongWaitTask',
    {
      pollInterval: 1*1000, // Poll every 1 second
    },
    function (job, callback) {
      // ##### THIS IS WHERE THE WORK GETS DONE #####//
      console.log("job process triggered");
      // Only called when there is a valid job

      //Run a meteor method as the task.

      Meteor.call('longWait', 5000, function(error, res){
        console.log("longWait Method callback");
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
  longWaitSubmit:function(){
    console.log('Sumbitting task type "callLongWaitTask" ');

    Job(waitQueue, //the job collection to use
      'callLongWaitTask', // type of job
      {} //job data
    ).save();// submit the job to status: "ready"

    return
  },
  longWait: function(milliseconds){
    console.log("Some work is being done in this Meteor method longWait" );

    var fut = new Future();

    //let's pretend the work takes 'milliseconds' time to complete.
    Meteor.setTimeout(function(){


       fut['return']("The return is delayed :" + milliseconds + "ms");

      // return "waiting " + milliseconds + "ms to return"
    }, milliseconds);

    return fut.wait();
  }
});
