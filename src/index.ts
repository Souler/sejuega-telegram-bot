import 'dotenv/config'
import * as functions from "firebase-functions";
import { Telegraf, Scenes,  session } from "telegraf"
import * as db from './db'

const token = functions.config().telegram.token
const bot = new Telegraf<any>(token, { telegram: { webhookReply: true } })

const newGroupWizard = new Scenes.WizardScene<any>(
  'NEW_GROUP_WIZARD_SCENE_ID',
  async ctx => {
    await ctx.reply('Ok, we are creating a new group. What\'s its name?')
    return ctx.wizard.next()
  },
  async ctx => {
    const groupName = ctx.message?.text
    const ownerId = ctx.message?.from.id

    const group = await db.createGroup({ name: groupName, ownerId })

    await ctx.reply(`Group "${group.name}" created\\. Code for joining: \`${group.joinCode}\``, {
      parse_mode: 'MarkdownV2',
    })

    return ctx.scene.leave()
  },
)


const joinGroupWizard = new Scenes.WizardScene<any>(
  'JOIN_GROUP_WIZARD_SCENE_ID',
  async ctx => {
    await ctx.reply('Trying to join a group? Send me its join code!')

    return ctx.wizard.next()
  },
  async ctx => {
    const joinCode = ctx.message.text
    const userId = ctx.message?.from.id

    try {
      const group = await db.findGroupMetadataByJoinCode(joinCode)
      await db.addGroupMember(group.groupId, userId)
      const members = await db.findGroupMembers(group.groupId)

      await ctx.reply(`Done\\! You just joined group **${group.name}** along ${members.length - 1} others\\!`, {
        parse_mode: 'MarkdownV2',
      })
      return ctx.scene.leave()
    } catch (err) {
      console.log(err)
      await ctx.reply('Looks like that join code is wrong :(')
      return ctx.wizard.next()
    }
  },
)

const startGameAppointmentWizard = new Scenes.WizardScene<any>(
  'START_GAME_APPOINTMENT_WIZARD_SCENE_ID',
  async ctx => {
    console.log(ctx.wizard.state)
    await ctx.reply('What game are we playing?', {
      reply_markup: {
        inline_keyboard: [
          [{text: 'Overwatch 2', callback_data: 'ow2' }],
          [{text: 'League of Legends', callback_data: 'lol' }],
          [{text: 'Guild Wars 2', callback_data: 'gw2' }],
        ]
      }
    })
    return ctx.wizard.next()
  },
  async ctx => {
    const game = ctx.callbackQuery.data
    ctx.wizard.state.game = ctx.callbackQuery.data
    await ctx.editMessageText(`Ok, we playing ${game}. At what time?`, {
      reply_markup: {
        inline_keyboard: [
          [
            {text: '10:00', callback_data: '10:00'},
            {text: '10:15', callback_data: '10:15'},
            {text: '10:30', callback_data: '10:30'},
            {text: '10:45', callback_data: '10:45'},
          ]
        ]
      }
    })
    return ctx.wizard.next()
  },
  async ctx => {
    console.log(ctx.message)
    const userId = ctx.callbackQuery?.from.id
    ctx.wizard.state.time = ctx.callbackQuery.data

    const groups = await db.findGroupsUserIsMemberOf(userId)
    
    await ctx.editMessageText(`Which group should I notify about this gathering?`, {
      reply_markup: {
        inline_keyboard: groups.map(group => [{ text: group.name, callback_data: group.groupId }])
      }
    })
    return ctx.wizard.next()
  },
  async ctx => {
    const groupId = ctx.callbackQuery.data
    ctx.wizard.state.groupId = groupId
    const group = await db.findGroupMetadata(groupId)
    const members = await db.findGroupMembers(groupId)

    await ctx.editMessageText(`Done! You have setup a gathering for platying ${ctx.wizard.state.game} at ${ctx.wizard.state.time} with ${group.name}`, {
      reply_markup: {
        inline_keyboard: []
      }
    })

    for (const memberId of members) {
      await ctx.telegram.sendMessage(memberId, `${ctx.chat?.type === 'private' && ctx.chat.username} is calling a game ${ctx.wizard.state.game} at ${ctx.wizard.state.time} with ${group.name}`, {
        reply_markup: {
          inline_keyboard: [
            [{text: 'yes', callback_data: 'yes', }, {text: 'no', callback_data: 'no', }]
          ],
        }
      })
    }

    return ctx.scene.leave()
  }
)

  const stage = new Scenes.Stage<any>([startGameAppointmentWizard, newGroupWizard, joinGroupWizard])
  
  bot.use(session())
  bot.use(stage.middleware())
  // stage.register(startGameAppointmentWizard)
  
  bot.start(ctx => {
    const userId = ctx.message?.from.id

    console.log('got start:', userId)
    return ctx.reply('lmao')
    
  })
  
  bot.command('sejuega', ctx => {
    // console.log('>>', 'ctx.scene', ctx.scene)
    return ctx.scene.enter('START_GAME_APPOINTMENT_WIZARD_SCENE_ID')
  })

  bot.command('newgroup', ctx => {
    // console.log('>>', 'ctx.scene', ctx.scene)
    return ctx.scene.enter('NEW_GROUP_WIZARD_SCENE_ID')
  })
  
  bot.command('joingroup', ctx => {
    // console.log('>>', 'ctx.scene', ctx.scene)
    return ctx.scene.enter('JOIN_GROUP_WIZARD_SCENE_ID')
  })
  
  
  // Enable graceful stop
//   process.once('SIGINT', () => bot.stop('SIGINT'));
  // process.once('SIGTERM', () => bot.stop('SIGTERM'));
  
  export const helloWorld = functions.https.onRequest(async (request, response) => {
    // response.send(`Hello from Firebase! Counter is: ${counter}`);
    functions.logger.info(`Incomming request`, request.body);
    await bot.handleUpdate(request.body, response)
  });
