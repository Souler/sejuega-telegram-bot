import assert from 'assert'
import { Scenes } from 'telegraf'
import store from '../../store'

export function startGameAppointmentWizardScene() {
  return new Scenes.WizardScene(
    'START_GAME_APPOINTMENT',

    async ctx => {
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

    async (ctx, next) => {
      // pass-through unexpected updates
      if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) {
        return next()
      }

      const game = ctx.callbackQuery.data
      Object.assign(ctx.wizard.state, { game })

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

    async (ctx, next) => {
      // pass-through unexpected updates
      if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) {
        return next()
      }
      
      const time =  ctx.callbackQuery.data
      Object.assign(ctx.wizard.state, { time })

      const userId = ctx.callbackQuery.from.id  
      const groups = await store.findUserGroups({ userId })
      
      await ctx.editMessageText(`Which group should I notify about this gathering?`, {
        reply_markup: {
          inline_keyboard: groups.map(group => [{ text: group.name, callback_data: group.groupId }])
        }
      })
      return ctx.wizard.next()
    },

    async (ctx, next) => {
      // pass-through unexpected updates
      if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) {
        return next()
      }

      const groupId = ctx.callbackQuery.data
      Object.assign(ctx.wizard.state, { groupId })

      const group = await store.findGroup({ groupId })
      const members = await store.findGroupMembers({ groupId })
      
      assert(group, `can't find group ${groupId}`)

      const { game, time } = ctx.wizard.state as Record<string, string>

      await ctx.editMessageText(`Done! You have setup a gathering for platying ${game} at ${time} with ${group.name}`, {
        reply_markup: {
          inline_keyboard: []
        }
      })
  
      for (const member of members) {
        await ctx.telegram.sendMessage(member.userId, `${ctx.chat?.type === 'private' && ctx.chat.username} is calling a game ${game} at ${time} with ${group.name}`, {
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
}