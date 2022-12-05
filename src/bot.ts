import { Telegraf, Context as TelegrafContext, Scenes } from 'telegraf'
import { createGroupWizardScene } from './bot/scenes/createGroup'
import { joinGroupWizardScene } from './bot/scenes/joinGroup'
import { listUserGroupsWizardScene } from './bot/scenes/listUserGroups'
import { startGameAppointmentWizardScene } from './bot/scenes/startGameAppointment'
import { session } from './bot/middlewares/session'
import { log } from './bot/middlewares/log'
import db from './database'

type BotContext = TelegrafContext & { scene: any } // FIXME: properly type this

export function configureBot(
  token: string,
  options?: Partial<Telegraf.Options<BotContext>>,
): Telegraf<BotContext> {
  const bot = new Telegraf<BotContext>(token, options)

  const createGroupScene = createGroupWizardScene()
  const joinGroupScene = joinGroupWizardScene()
  const listUserGroupsScene = listUserGroupsWizardScene()
  const startGameAppointmentScene = startGameAppointmentWizardScene()
  const stage = new Scenes.Stage<any>([
    createGroupScene,
    joinGroupScene,
    listUserGroupsScene,
    startGameAppointmentScene,
  ])

  bot.use(log())
  bot.use(session())
  bot.use(stage.middleware())

  bot.command('start', async (ctx, next) => {
    await db.saveUser({
      userId: ctx.from.id,
      firstName: ctx.from.first_name,
      username: ctx.from.username ?? null,
    })
    return next()
  })

  bot.command('newgroup', ctx => ctx.scene.enter(createGroupScene.id))
  bot.command('joingroup', ctx => ctx.scene.enter(joinGroupScene.id))
  bot.command('listgroups', ctx => ctx.scene.enter(listUserGroupsScene.id))
  bot.command('sejuega', ctx => ctx.scene.enter(startGameAppointmentScene.id))

  return bot
}
