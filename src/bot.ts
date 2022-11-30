import { Telegraf, Context as TelegrafContext, Scenes, session } from 'telegraf'
import { createGroupWizardScene } from './scenes/createGroup'
import { joinGroupWizardScene } from './scenes/joinGroup'
import { startGameAppointmentWizardScene } from './scenes/startGameAppointment'
import store from './store'

type BotContext = TelegrafContext & { scene: any } // FIXME: properly type this

export function configureBot(token: string, options?: Partial<Telegraf.Options<BotContext>>): Telegraf<BotContext> {
  const bot = new Telegraf<BotContext>(token, options)

  const createGroupScene = createGroupWizardScene()
  const joinGroupScene = joinGroupWizardScene()
  const startGameAppointmentScene = startGameAppointmentWizardScene()
  const stage = new Scenes.Stage<any>([
    createGroupScene,
    joinGroupScene,
    startGameAppointmentScene,
  ])

  bot.use(session())
  bot.use(stage.middleware())

  bot.command('start', async (ctx, next) => {
    await store.saveUser({
      userId: ctx.from.id,
      firstName: ctx.from.first_name,
      username: ctx.from.username ?? null,
    })
    return next()
  })

  bot.command('newgroup', ctx => ctx.scene.enter(createGroupScene.id))
  bot.command('joingroup', ctx => ctx.scene.enter(joinGroupScene.id))
  bot.command('sejuega', ctx => ctx.scene.enter(startGameAppointmentScene.id))

  return bot
}
