import { MiddlewareFn, Context } from 'telegraf'

export function log(): MiddlewareFn<Context> {
  return (ctx, next) => {
    console.log('>> update', ctx.updateType, ctx.update.update_id, ctx.update)
    next()
  }
}
