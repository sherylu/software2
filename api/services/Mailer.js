module.exports.sendBookingEmail = function(client) {
     sails.hooks.email.send(
         
         'bookingEmail', 
         
         {
            name: client.firstName
         },
         
         {
            to: client.email,
            subject: client.subject
         },
         
         function(err) {
             console.log(err || 'Mail Sent!');
             
         }
     );
}