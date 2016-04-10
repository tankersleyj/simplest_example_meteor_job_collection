import { Template } from 'meteor/templating';
import './main.html';

Template.hello.events({
  'click button'(event, instance) {
    // increment the counter when button is clicked
    Meteor.call('submit')
  },
});
