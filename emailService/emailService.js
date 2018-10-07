var nodemailer = require('nodemailer');


var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'fitnessBuddyWebexMeetings@gmail.com',
        pass: process.env.AUTOBOTEMAILPASSWORD
    }
});


module.exports = {

    sendEmail: function(emailAddress, toMentor, customerName, mentorName, mentorEmail, appointmentDay) {
        let commonMessage = `Appointment Day: ${appointmentDay} next week`;
        let message;
        if (toMentor) {
            message = "Hello Mentor, \n" + "\n" + `You have an appointment scheduled with: ${customerName}` + "\n" + `${commonMessage}` + "\n" + "They have been given your email id and will reach out shortly" + "\n" + "Regards" + "\n" + "Team FitnessBuddy"
        } else {
            message = "Hello  \n" + "\n" + `You have scheduled a session with your mentor: ${mentorName}` + "\n\n" + `${commonMessage}` + "\n" + `Email address of your mentor is: ${mentorEmail}` +"\n\n" + "Regards" + "\n" + "Team FitnessBuddy"
        }
        var mailOptions = {
            from: 'fitnessBuddyWebexMeetings@gmail.com',
            to: emailAddress,
            subject: 'Webex meeting invite',
            text: message
        };

        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    }

}
