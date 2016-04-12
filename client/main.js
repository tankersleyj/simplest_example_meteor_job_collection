import { Template } from 'meteor/templating';
import './main.html';

Template.hello.events({
  'click #basicSubmit'(event, instance) {
    // increment the counter when button is clicked
    Meteor.call('basicSubmit')
  },
  'click #repeatSubmit'(event, instance) {
    // increment the counter when button is clicked
    Meteor.call('repeatSubmit')
  },
});
