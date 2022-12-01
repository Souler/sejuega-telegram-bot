import 'dotenv/config'
import assert from 'assert'
import { configureBot } from './bot'
import { initializeStore } from './store'

const token = process.env.TELEGRAM_BOT_TOKEN
assert(token, 'missing environment variable TELEGRAM_BOT_TOKEN')

initializeStore('dev')

const bot = configureBot(token)

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

bot.launch({
  dropPendingUpdates: true, 
})
