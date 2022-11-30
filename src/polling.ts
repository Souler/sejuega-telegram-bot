import 'dotenv/config'
import assert from 'assert'
import { configureBot } from './bot'
import { inistializeStore } from './store'

const token = process.env.TELEGRAM_BOT_TOKEN
assert(token, 'missing environment variable TELEGRAM_BOT_TOKEN')

inistializeStore('memory')

const bot = configureBot(token)

// FIXME: We need to move this into configureBot, otherwise we lose the already handled updates!
bot.use((ctx, next) => {
  console.log('>> update', ctx.updateType, ctx.update.update_id, ctx.update)
  next()
})

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

bot.launch({
  dropPendingUpdates: true, 
})
