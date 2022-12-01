import { Scenes } from 'telegraf'
import db from '../../database'

export function createGroupWizardScene() {
  return new Scenes.WizardScene(
    'CREATE_GROUP',

    async ctx => {
      await ctx.reply('Ok, we are creating a new group. What\'s its name?')
      return ctx.wizard.next()
    },

    async (ctx, next) => {
      // pass-through unexpected updates
      if (!ctx.message || !('text' in ctx.message)) {
        return next()
      }

      const groupName = ctx.message?.text
      const userId = ctx.message?.from.id  
      const group = await db.createGroup({ name: groupName, ownerId: userId })
  
      await ctx.reply(
        `Group "${group.name}" created\\. Code for joining: \`${group.joinCode}\``,
        { parse_mode: 'MarkdownV2' },
      )
  
      return ctx.scene.leave()
    },
  )
}
