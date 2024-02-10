import Bot from "slackbots";
import dotenv from "dotenv"

dotenv.config();

const settings = {
    token: process.env.TOKEN,
    signingSecret: process.env.SIGNING_SECRET
}

export const bot = new Bot(settings)
