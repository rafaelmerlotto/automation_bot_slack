import dotenv from "dotenv"
import express from "express";
import { google } from "googleapis"
import { bot } from "./bot_slack.js";
import { parse } from 'node-html-parser';

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
    res.send( 'You have succesfully logged in. <a href="http://localhost:4000/event_list">Click here!</a>' )
})


function eventsMaxTime(hours, seconds) {
    const date = new Date();
    return date.setHours(hours, seconds)
}


server.get("/event_list", async (req, res) => {

    const data = await calendar.events.list({
        auth: oauth2Client,
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        timeMax: new Date(eventsMaxTime(20, 0)),
        orderBy: 'startTime',
        timeZone: "Europe/Rome"
    });

    data.data.items.map((e) => {
        bot.on("message", () => {
            setInterval(() => {
                bot.postMessageToChannel("calendar-events-today", `
                  🗓️ Calendar event today
                  - event: ${e.summary}
                  - description: ${e.description}
                  - start: ${e.start.dateTime}
                  - end: ${e.end.dateTime}
                  - status: ${e.status}
                  `)
            }, (1000 * 60));
        })
    })
    res.send("Server is running 🚀")
})

const PORT = 4000;


server.listen(PORT, () => {
    console.log(`server is running on 🚀 http://localhost:${PORT}/google`)
})















