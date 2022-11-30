import { Scenes } from 'telegraf'
import store from '../store'

export function joinGroupWizardScene() {
  return new Scenes.WizardScene(
    'JOIN_GROUP_WIZARD_SCENE_ID',
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

      const group = await store.findGroup({ joinCode })

      if (!group) {
        await ctx.reply('Looks like that join code is wrong :(')
        return ctx.wizard.next()
      }

      await store.addGroupMember({ groupId: group.groupId, userId })

      const members = await store.findGroupMembers({ groupId: group.groupId })
  
      await ctx.reply(
        `Done\\! You just joined group **${group.name}** along ${members.length - 1} others\\!`,
        { parse_mode: 'MarkdownV2' },
      )

      return ctx.scene.leave()
    },
  )
}
