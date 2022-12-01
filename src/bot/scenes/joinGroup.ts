import { Scenes } from 'telegraf'
import db from '../../database'

export function joinGroupWizardScene() {
  return new Scenes.WizardScene(
    'JOIN_GROUP',
    async ctx => {
      await ctx.reply('Trying to join a group? Send me its join code!')
  
      return ctx.wizard.next()
    },

    async (ctx, next) => {
      // pass-through unexpected updates
      if (!ctx.message || !('text' in ctx.message)) {
        return next()
      }

      const joinCode = ctx.message.text
      const userId = ctx.message.from.id

      const group = await db.findGroup({ joinCode })

      if (!group) {
        await ctx.reply('Looks like that join code is wrong :(')
        return ctx.wizard.next()
      }

      await db.addGroupMember({ groupId: group.groupId, userId })

      const members = await db.findGroupMembers({ groupId: group.groupId })
  
      await ctx.reply(
        `Done\\! You just joined group **${group.name}** along ${members.length - 1} others\\!`,
        { parse_mode: 'MarkdownV2' },
      )

      return ctx.scene.leave()
    },
  )
}
