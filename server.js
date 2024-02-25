const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const RateLimit = require('express-rate-limit');

dotenv.config();

const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors());
app.use(express.json());

// Set up rate limiter: maximum of twenty requests per minute
const limiter = RateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20,
});
// Apply rate limiter to all requests
app.use(limiter);

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

const router = express.Router();

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


app.use('/', router);


app.use((req, res, next) => {
    res.status(404).send("Sorry can't find that!")
});

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}...`));
