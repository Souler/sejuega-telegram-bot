import assert from 'assert'
import { Scenes } from 'telegraf'
import db from '../../database'

export function listUserGroupsWizardScene() {
  return new Scenes.WizardScene(
    'LIST_USER_GROUPS',
    async (ctx, next) => {
      if (!ctx.from) {
        return next()
      }
      const userId = ctx.from.id
      const groups = await db.findUserGroups({ userId })

      await ctx.reply(`Ok, here are your groups, click on any of them to see their members.`, {
        reply_markup: {
          inline_keyboard: groups.map(group => [{ text: group.name, callback_data: group.groupId }]),
        },
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

      const group = await db.findGroup({ groupId })
      const members = await db.findGroupMembers({ groupId })

      assert(group, `can't find group ${groupId}`)

      const membersList = members
        .map((member, index) => `${index + 1}\\. ${member.username ?? member.firstName}\n`)
        .join('')

      await ctx.editMessageText(
        `Here you go, these are the members of the group **${group.name}**:\n${membersList}`,
        {
          parse_mode: 'MarkdownV2',
        },
      )

      return ctx.scene.leave()
    },
  )
}
