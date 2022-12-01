import assert from 'assert'
import { initializeApp } from 'firebase-admin/app'
import * as functions from 'firebase-functions'
import { configureBot } from './bot'
import { initializeStore } from './store'

const token = functions.config().telegram.token
assert(token, 'missing firebase functions config: telegram.token')

initializeApp()
initializeStore('firebase')

const bot = configureBot(token, { telegram: { webhookReply: true } })

export const handleUpdate = functions.https.onRequest(async (request, response) => {
  functions.logger.info(`Incomming webhook update`, request.body);

  if (!request.url.endsWith(token)) {
    response.status(400).send()
    return
  }

  await bot.handleUpdate(request.body, response)
})
