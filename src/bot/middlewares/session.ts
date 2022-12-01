import { MiddlewareFn, Context } from 'telegraf'
import store from '../../store'

interface SessionOptions {
  property?: string,
  getSessionKey?: (ctx: Context) => string | undefined
}

export function session(options: SessionOptions = {}): MiddlewareFn<Context> {
  const {
    property = 'session',
    getSessionKey = ctx => ctx.from && ctx.chat && `_sessions/${ctx.from.id}/${ctx.chat.id}`,
  } = options 

  return async (ctx, next) => {
    const key = getSessionKey(ctx)

    if (!key) {
      return next()
    }

    let session = (await store.get(key)) ?? {}
    Object.defineProperty(ctx, property, {
      get: () => session,
      set: (newValue) => { session = Object.assign({}, newValue) },
    })

    await next()
    await store.update({
      [key]: session && Object.keys(session).length > 0 ? session : null
    })
  }
}
