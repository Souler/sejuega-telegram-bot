import 'dotenv/config'
import assert from 'assert'
import { initializeApp } from 'firebase-admin/app'
import { configureBot } from './bot'

const token = process.env.TELEGRAM_BOT_TOKEN
const databaseURL = process.env.FIREBASE_DATABASE_URL

assert(token, 'missing environment variable TELEGRAM_BOT_TOKEN')
assert(databaseURL, 'missing environment variable FIREBASE_DATABASE_URL')

initializeApp({ databaseURL })

const bot = configureBot(token)

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

bot.launch({
  dropPendingUpdates: true, 
})
