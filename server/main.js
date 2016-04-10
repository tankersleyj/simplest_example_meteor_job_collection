import { Meteor } from 'meteor/meteor';

myJobs = JobCollection('myJobQueue');

Meteor.startup(function () {
  // Start the myJobs queue running
  return myJobs.startJobServer();
});

// Start the queue for jobs fo type 'echo'
myJobs.processJobs( // TODO: shouldn't this run in startup?
  // Type of job to request
  // Can also be an array of job types
  'echo',
  {
    pollInterval: 1*1000, // Poll every 1 second
  },
  function (job, callback) {
    // ##### THIS IS WHERE THE WORK GETS DONE #####//
    console.log("job process triggered");
    // Only called when there is a valid job

    //job.data is a data object the developer can pass when submitting up a new job.
    console.log( job.data );

    job.done(); // Mark the job done
    callback(); // TODO: what is this? Can the dev modify this?
  }
);

Meteor.methods({
  submit:function(){
    console.log('Sumbitting test job "Echo" ');

    var newEchoJob = new Job(myJobs, //the job collection to use
      'echo', // type of job
      // A data object that will be made available to the job worker. See 'job.data' above
      {
        message: 'Hello, is there anybody in here?'
      }
    );

    // Set some properties of the job
    newEchoJob.priority('normal');

    newEchoJob.repeat({
      repeats: 2, //the 'echo': repeats two more times in addition to the initial. This spawns new 'myJobs' tasks/docs
      wait: 10 //milliseconds TODO: why is this waiting 15 seconds between repeats? Is something blocking?
    });

    // submit the job, will set the status to 'waiting'.
    newEchoJob.save();

    return
  }
});
