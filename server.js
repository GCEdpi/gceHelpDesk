const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');
const app = express();
const port = 4011;

let db;

function handleDisconnect() {
  db = mysql.createPool({
    connectionLimit: 1000,
    host: 'sql12.freesqldatabase.com',
    user: 'sql12706859',
    password: 'sElwkdMRic',
    database: 'sql12706859',
    port: 3306
  });
  db.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to database:', err);
      return;
    }
    console.log('Connected to database');
    connection.release();
  });

}

handleDisconnect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());


app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});




// Email sender configuration
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use your email service (e.g., Gmail, Outlook, etc.)
  auth: {
    user: 'gcedpihelpdesk@gcedpi.edu.in', // Replace with your email
    pass: 'qgbw ajtt ehnn finx', // Replace with your email password or app password
  },
});

/**
 * Function to send an email to a client
 * @param {string} from - The sender's email address
 * @param {Array<string>} mail - List of recipient email addresses
 * @param {string} message - The message body of the email
 */
const sendMailToClient = async (from, mail,subject, message) => {
    const emailSubject = subject; // You can modify or parameterize the subject if needed
  
    for (const recipient of mail) {
      const mailOptions = {
        from: from,
        to: recipient,
        subject: emailSubject,
        html: message,
      };
  
      try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${recipient}: ${info.response}`);
      } catch (error) {
        console.error(`Failed to send email to ${recipient}:`, error);
      }
    }
};
  
// Example usage
const from = 'gcedpihelpdesk@gcedpi.edu.in';
let admail=['tamilarasu.k369@gmail.com'] // Sender email


function generateUniqueToken() {
    // Generate 9 random characters
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = 8;
    let randomPart = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomPart += characters[randomIndex];
    }
    const datePart = new Date().toISOString().slice(2, 8).replace('-', '').replace('-', '');
    const millisecondsPart = new Date().getMilliseconds(); // Get milliseconds (0 to 999)
    return randomPart + datePart + millisecondsPart;
}

function  messageformating(tokenid){
  const query = `
        SELECT name, email_id, TypeOfConcern, Grievance, reply 
        FROM HelpDesk 
        WHERE ticketid = ?`;

  db.query(query, [tokenid], (err, results) => {
        if (err) {
            console.log("Error executing query:", err);
            
        }

        if (results.length === 0) {
            console.log("Error executing query:", err);
        }

        // Assign values to variables
        const name = results[0].name;
        const emailId = [results[0].email_id];
        const TypeOfConcern = results[0].TypeOfConcern;
        const Grievance = results[0].Grievance;
        const reply = results[0].reply;
        const sub = "We have reviewed your concern regarding - "+tokenid;
        const mailMessage = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Response to Your Concern</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px;">
                <h2 style="color: #4CAF50;">Response to Your Concern</h2>
                <p>Respected Mr|Mrs<strong>${name}</strong>,</p>
                <p>We have reviewed your concern regarding: <span id="ticketid">${tokenid}</span></p>
                <blockquote style="border-left: 4px solid #4CAF50; padding-left: 10px; color: #555;">
                    <strong>Subject:</strong> ${TypeOfConcern}<br>
                    <strong>About:</strong> ${Grievance}
                </blockquote>
                <p>Here is our response:</p>
                <blockquote style="border-left: 4px solid #4CAF50; padding-left: 10px; color: #555;">
                    ${reply || "We are still reviewing your concern and will get back to you shortly."}
                </blockquote>
                <p>Thank you for bringing this matter to our attention. If you have further questions, feel free to fill the form.</p>
                <p>Warm regards,</p>
                <p><strong>The Admin Team</strong></p>
                <script>
                  document.getElementById("copy-ticketid").addEventListener("click", function () {
                      // Get the ticket ID
                      const ticketId = document.getElementById("ticketid").textContent;

                      // Copy the ticket ID to the clipboard
                      navigator.clipboard.writeText(ticketId)
                          .then(() => {
                              alert("Ticket ID copied to clipboard: " + ticketId);
                          })
                          .catch((err) => {
                              console.error("Failed to copy ticket ID: ", err);
                              alert("Unable to copy ticket ID. Please try again.");
                          });
                  });
              </script>
            </body>
            </html>
            `;
          
            sendMailToClient(from,emailId,sub,mailMessage)




      });


}



app.get('/search', (req, res) => {
  const token = req.query.token;
  console.log(token);
  // Query the database based on the token
  const query = `SELECT * FROM HelpDesk WHERE ticketid = ?`;
  db.query(query, [token], (err, results) => {
      if (err) {
          console.error(err);
          res.status(500).send("Server Error");
          return;
      }
      console.log("data is retrived from database", results.length);

      if (results.length === 0) {
          res.json(0); // No match
      } else {
          res.json(results[0]); // Send the matching record
      }
  });
});


//contact route
app.post('/contact', (req, res) => {
      const {
          name,
          phone_number,
          email_id,
          place,
          district,
          respondent_type,
          type_of_concern,
          grievance,
          date
      } = req.body;
      let token = generateUniqueToken();
      // Log the received email to the server console
      // console.log(`Received Email: ${email_id}`);


      let mail = [email_id];
      let csub="Conformation On Your Form - reg..."
      let message =  `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f9;
                    color: #333;
                }
                .email-container {
                    max-width: 600px;
                    margin: 20px auto;
                    background: #fff;
                    border-radius: 10px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    padding: 20px;
                }
                .email-header {
                    background-color: #4CAF50;
                    color: white;
                    text-align: center;
                    padding: 15px 20px;
                    border-top-left-radius: 10px;
                    border-top-right-radius: 10px;
                }
                .email-header h1 {
                    margin: 0;
                    font-size: 1.5em;
                }
                .email-body {
                    padding: 20px;
                }
                .email-body h2 {
                    font-size: 1.2em;
                    color: #4CAF50;
                    margin-bottom: 10px;
                }
                .email-body p {
                    line-height: 1.6;
                    margin: 10px 0;
                }
                .email-body .token {
                    font-size: 1.1em;
                    font-weight: bold;
                    color: #4CAF50;
                }
                .email-body a {
                    color: #1a73e8;
                    text-decoration: none;
                }
                .email-body a:hover {
                    text-decoration: underline;
                }
                .email-footer {
                    text-align: center;
                    padding: 15px 20px;
                    font-size: 0.9em;
                    color: #666;
                    border-top: 1px solid #ddd;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="email-header">
                    <h1>Thank You for Reaching Out</h1>
                </div>
                <div class="email-body">
                    <p>Dear Mr|Mrs <strong>${name}</strong>,</p>
                    <p>We have received your concern and are currently reviewing it. We value your input and strive to provide prompt assistance for all inquiries.</p>
                    <h2>Details of Your Concern:</h2>
                    <p><strong>Type of Concern:</strong> ${type_of_concern}</p>
                    <p><strong>Grievance:</strong> ${grievance}</p>
                    <p>Your Token ID is: <span class="token">${token}</span>. Use it to track your application status at <a href="https://gcehelpdesk.onrender.com" target="_blank">our website</a>.</p>
                    <p>Thank you for your patience and understanding. If you have any additional questions, feel free to reach out to us at any time.</p>
                </div>
                <div class="email-footer">
                    <p>&copy; 2024 Support Team. All Rights Reserved.</p>
                    
                    <p>Please do not reply to this email. For further assistance, contact our support team.</p>
                </div>
            </div>
        </body>
        </html>
      `;


      

      let body=grievance;
      let subject = "Regarding -" +type_of_concern + " from Helpdesk form by"+ respondent_type;
      let m = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f9;
                    color: #333;
                }
                .email-container {
                    max-width: 600px;
                    margin: 20px auto;
                    background: #fff;
                    border-radius: 10px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    padding: 20px;
                }
                .email-header {
                    background-color: #FF5733;
                    color: white;
                    text-align: center;
                    padding: 15px 20px;
                    border-top-left-radius: 10px;
                    border-top-right-radius: 10px;
                }
                .email-header h1 {
                    margin: 0;
                    font-size: 1.5em;
                }
                .email-body {
                    padding: 20px;
                }
                .email-body h2 {
                    font-size: 1.2em;
                    color: #FF5733;
                    margin-bottom: 10px;
                }
                .email-body p {
                    line-height: 1.6;
                    margin: 10px 0;
                }
                .email-body .highlight {
                    font-size: 1.1em;
                    font-weight: bold;
                    color: #FF5733;
                }
                .email-body a {
                    color: #1a73e8;
                    text-decoration: none;
                }
                .email-body a:hover {
                    text-decoration: underline;
                }
                .email-footer {
                    text-align: center;
                    padding: 15px 20px;
                    font-size: 0.9em;
                    color: #666;
                    border-top: 1px solid #ddd;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="email-header">
                    <h1>New Inquiry Alert</h1>
                </div>
                <div class="email-body">
                    <p>Respected Admins,</p>
                    <p>&nbsp;&nbsp;&nbsp;&nbsp;A new inquiry has been submitted by <strong>${name}</strong> (Email: <strong>${email_id}</strong>).</p>
                    <h2>Token ID:</h2>
                    <p><span class="highlight">${token}</span></p>
                    <p>Use it to address the issue via the following link: <a href="https://gcehelpdesk.onrender.com/Gcedpi_help_desk_admin.html" target="_blank">Track Inquiry</a>.</p>
                    <h2>Details of the Inquiry:</h2>
                    <p>${body}</p>
                </div>
                <div class="email-footer">
                    <p>&copy; 2024 Support Team. All Rights Reserved.</p>
                    <p>Please prioritize addressing this inquiry promptly.</p>
                </div>
            </div>
        </body>
        </html>
      `;
      
      

      // SQL query to insert the data into the database
      const sql = `INSERT INTO HelpDesk (name, phone_number, email_id, place, district, RespondentType, TypeOfConcern, Grievance,ticketid ,date, status)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?,?,?,0)`;

      const values = [
          name,
          phone_number,
          email_id,
          place,
          district,
          respondent_type,
          type_of_concern,
          grievance,
          token,
          date
      ];

      // Execute the query
      db.query(sql, values, (err, result) => {
          if (err) {
              console.error('Database insertion error:', err);
              return res.status(500).send('Failed to store data in the database.');
          }


          console.log('Data inserted with ID:', result.insertId);
          sendMailToClient(from, mail, csub, message);
          sendMailToClient(from, admail, subject, m);

          // Send OK response
          res.status(200).send('Form submitted successfully!');
      });
});




app.get('/load', (req, res) => {
  const filter = req.query.filter;
    let query = "SELECT * FROM HelpDesk"; // Your table name

    if (filter === "pending") {
        query += " WHERE status = 0";
    } else if (filter === "successful") {
        query += " WHERE status = 1 ";
    } else if (filter === "newest") {
        query += " ORDER BY sno DESC";
    } else if (filter === "oldest") {
        query += " ORDER BY sno ASC";
    }

  db.query(query, (err, results) => {
    console.log("entered inside load");
      if (err) {
          console.error("Error loading records:", err);
          return res.status(500).json({ error: "Internal Server Error" });
      }
      console.log("data is send to client");
      console.log("Total rows selected:", results.length);
      res.status(200).json(results);
  });
});

// Route to mark a record as read
app.post('/markread', (req, res) => {
  const { tokenid } = req.body;  
  if (!tokenid) {
      return res.status(400).json({ error: "Token ID is required" });
  }  
  const query = 'UPDATE HelpDesk SET status = 1 WHERE ticketid = ?';   
  db.query(query, [tokenid], (err, result) => {
      if (err) {
          console.error("Error marking record as read:", err);
          return res.status(500).json({ error: "Internal Server Error" });
      }
      if (result.affectedRows > 0) {
          messageformating(tokenid);
          res.status(200).json({ message: "Record marked as read successfully" });
      } else {
          res.status(404).json({ error: "Record not found" });
      }
  });
});

// Route to reply to a record
app.post('/reply', (req, res) => {
  const { tokenid, reply } = req.body;

  if (!tokenid || reply === undefined) {
      return res.status(400).json({ error: "Token ID and reply are required" });
  }

  const query = 'UPDATE HelpDesk SET reply = ?, status = 1 WHERE ticketid = ?';

  db.query(query, [reply, tokenid], (err, result) => {
      if (err) {
          console.error("Error updating reply:", err);
          return res.status(500).json({ error: "Internal Server Error" });
      }
      if (result.affectedRows > 0) {
        messageformating(tokenid);
        res.status(200).json({ message: "Reply updated successfully" });
      } else {
          res.status(404).json({ error: "Record not found" });
      }
  });
});






// Handle 404 errors for other routes
app.use((req, res) => {
    res.status(404).send('Endpoint not found');
});






app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

