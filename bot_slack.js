import dotenv from "dotenv"
import express from "express";
import { google } from "googleapis"


dotenv.config();
const server = express();


const calendar = google.calendar({
    version: "v3",
    auth: process.env.API_KEY
})

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL,
)

const scopes = [
    'https://www.googleapis.com/auth/calendar'
]

server.get("/google", (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: "online",
        scope: scopes
    })
    res.redirect(url)
})

server.get("/google/redirect", async (req, res) => {
    const code = req.query.code;
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    res.send("<h1> You have succesfully logged in </h1> ")
})



server.get("/event_list", async (req, res) => {

const data = await calendar.events.list({
        auth: oauth2Client,
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        // timeMax:   new Date(),
        orderBy: 'startTime',
        timeZone: "Europe/Rome"
    });

    res.send(JSON.stringify(data.data))
})

const PORT = 4000;


server.listen(PORT, () => {
    console.log(`server is running on 🚀 http://localhost:${PORT}/google`)
})















