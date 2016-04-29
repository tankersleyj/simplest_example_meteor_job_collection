import { Meteor } from 'meteor/meteor';
// import Future from 'fibers/future';
multipleQueue = JobCollection('multipleQueue');

Meteor.startup(function(){
  multipleQueue.startJobServer();

  multipleQueue.processJobs(
    // Type of job to request
    // Can also be an array of job types
    'sendEmail',
    {
      pollInterval: 1*1000, // Poll every 1 second
    },
    function (job, callback) {
      // ##### THIS IS WHERE THE WORK GETS DONE #####//
      console.log('SEND Email', job.data );

      job.done()
      callback(); // TODO: what is this? Can the dev modify this?
    }
  );

  multipleQueue.processJobs(
    // Type of job to request
    // Can also be an array of job types
    'archiveEmail',
    {
      pollInterval: 1*1000, // Poll every 1 second
    },
    function (job, callback) {
      // ##### THIS IS WHERE THE WORK GETS DONE #####//
      console.log('ARCHIVE Email', job.data);

      job.done()
      callback(); // TODO: what is this? Can the dev modify this?
    }
  );
});


Meteor.methods({
  triggerMultiple:function(){
    // Create an 'antecedent' job:
    var sendJob =  new Job(multipleQueue, 'sendEmail', {
      address: 'bozo@clowns.com',
      subject: 'Critical rainbow hair shortage',
      message: 'LOL; JK, KThxBye.'
    });

    //create a 'dependent job'
    var archiveJob = new Job(multipleQueue, 'archiveEmail', { mydata:"data" } );

    sendJob.save( function(error, res){
      console.log("sendJob successfully saved");
      if (res) {
        console.log('id is : ', res);

        // This is what is necessary to create a dependency.
        //it's in the callback because we need to make sure sendJob 'antecedent' is ready
        archiveJob.depends( [ sendJob ]  ).save()

      }
    });
  }
});
