const pgp = require('pg-promise')(/* options */)
const env = require('dotenv').config()
const connection = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    max: 1 // use up to 1 connection
}
const db = pgp(connection)

// This will be where the Lambda function code for the scheduled CRON jobs will go
exports.handler = async (event) => {
    console.log('Running CRON job')

    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.GMAIL_EMAIL,
            pass: process.env.GMAIL_PASS,
        },
    });

    const sendMail = async (transporter, mailOptions) => {
        try {
            const info = await transporter.sendMail(mailOptions);
            console.log("Message sent: %s", info.messageId);
        } catch (error) {
            console.log(error);
        }
    }

    const getUserEmail = async (waitlist) => {
        const email = await db.one('SELECT email FROM users WHERE username = $1', waitlist.requestor)
            .then(data => {
                return data.email
            })
            .catch(error => {
                console.log('ERROR:', error)
            })

        return email
    }

    const getCourseInfo = async (waitlist) => {
        // Array of async functions to wait for, preventing AWS Lambda invocation from exiting early
        let asyncs = []

        // Format data for request
        const postData = {
            group: waitlist.groups,
            key: `crn:${waitlist.crn}`,
            srcdb: waitlist.srcdb,
            matched: waitlist.matched
        }
        const apiURL = 'https://classes.oregonstate.edu/api/?page=fose&route=details'
        
        // Get course availability information
        const courseData = await fetch(apiURL, {
            method: 'POST',
            processData: false,
            contentType: 'application/json',
            body: encodeURIComponent(JSON.stringify(postData)),
            dataType: 'json'
        })
        .then(response => response.json())
        console.log("Course Requested:", courseData.code);

        // Send email if spot is available
        if (courseData.max_enroll !== courseData.enrollment) {
            console.log(`Spot available for ${courseData.code}!`)
            
            // Get email of waitlist.requestor
            const reciever = await getUserEmail(waitlist)
            asyncs.push(reciever)

            
            // Send email to waitlist.requestor
            const mailOptions = {
                from: {
                    name: "OSU Waitlist Notifier",
                    address: process.env.GMAIL_EMAIL
                }, // sender address
                to: [reciever], // list of receivers
                subject: `Spot Available for ${courseData.title}!`, // Subject line
                text: `Beep boop! It looks like the course ${courseData.code} has an available spot for you!`, // plain text body
                html: `<b>Beep boop! It looks like the course ${courseData.code} has an available spot for you!</b>`, // html body
            };
            asyncs.push(sendMail(transporter, mailOptions))

            // Delete waitlist from database
            asyncs.push(db.one('DELETE FROM waitlists WHERE id = $1', waitlist.id)
                .then(data => {
                    console.log('DATA:', data.id)
                })
                .catch(error => {
                    console.log('ERROR:', error)
                })
            );
        }

        await Promise.all(asyncs)
        return;
    }

    let waitlists = []
    // Get all waitlists and send requests to each one
    await db.any('SELECT * FROM waitlists')
        .then(async data => {
            data.forEach(async (waitlist) => {
                waitlists.push(getCourseInfo(waitlist))
            })
        })
        .catch(error => {
            return error
        });
    
    await Promise.all(waitlists);
    
    return;
}


