const nodemailer = require('nodemailer');

console.log("hi")
// Email sender configuration
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use your email service (e.g., Gmail, Outlook, etc.)
  auth: {
    user: 'aforapplebforball987@gmail.com', // Replace with your email
    pass: 'yvuz gako esug eyjl', // Replace with your email password or app password
  },
});

// List of recipients
const emailList = [
  'tamilarasu.k369@gmail.com','sspoovarasan65@gmail.com'
];

// Email content
const emailSubject = 'Testing 1';
const emailBody = 'Hello! This is a test email sent from lab.';

// Function to send email
const sendEmails = async () => {
  for (const recipient of emailList) {
    const mailOptions = {
      from: 'UNKNOWN',
      to: recipient,
      subject: emailSubject,
      text: emailBody,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${recipient}: ${info.response}`);
    } catch (error) {
      console.error(`Failed to send email to ${recipient}:`, error);
    }
  }
};

// Call the function
sendEmails();
