import { MiddlewareFn, Context } from 'telegraf'
import firebaseSession from 'telegraf-session-firebase'
import { getDatabase } from 'firebase-admin/database'

export function session(): MiddlewareFn<Context> {
  const sesionsRef = getDatabase().ref('sessions')
  return firebaseSession(sesionsRef, { property: '_sessions' })
}
