import assert from 'assert'
import * as functions from 'firebase-functions'
import { configureBot } from './bot'
import { inistializeStore } from './store'

const token = functions.config().telegram.token
assert(token, 'missing firebase functions config: telegram.token')

inistializeStore('memory') // FIXME: change to firebase once availbale

const bot = configureBot(token, { telegram: { webhookReply: true } })

export const handleUpdate = functions.https.onRequest(async (request, response) => {
  functions.logger.info(`Incomming webhook update`, request.body);
  await bot.handleUpdate(request.body, response)
})
