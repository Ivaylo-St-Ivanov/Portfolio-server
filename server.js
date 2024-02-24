const express = require('express');
const router = express.Router();
const cors = require('cors');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

dotenv.config();

const contactEmail = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

contactEmail.verify((error) => {
    if (error) {
        console.log(error);
    } else {
        console.log('Server is ready to take messages.');
    }
});

router.post('/contact', (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const subject = req.body.subject;
    const message = req.body.message;

    const mail = {
        from: name,
        to: process.env.EMAIL_USER,
        subject: subject,
        html: `<p>Name: ${name}</p>
               <p>Email: ${email}</p>
               <p>Subject: ${subject}</p>
               <p>Message: ${message}</p>`
    };

    contactEmail.sendMail(mail, (error) => {
        if (error) {
            res.json({ status: 'Fail' });
        } else {
            res.json({ status: 'Successful sent' });

            contactEmail.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Submission was successful.',
                html: `<p>Thank you for contacting me!</p>
                       <p>Form details:</p>
                       <p>Name: ${name}</p>
                       <p>Email: ${email}</p>
                       <p>Subject: ${subject}</p>
                       <p>Message: ${message}</p>`
            }, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Message sent' + info.response);
                }
            });
        }
    });
});


const app = express();

app.use(cors());
app.use(express.json());
app.use('/', router);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}...`));
