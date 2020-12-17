import { mainMenuKeyboard } from './index';
import { setTelegramData, getTelegramChat } from './utils/OffchainUtils';
import { checkAddress } from '@polkadot/util-crypto';
const Scene = require('telegraf/scenes/base')

export class SceneGenerator {
	getBalanceScene() {
		const scene = new Scene('address')
		scene.enter(async (ctx) => {
			await ctx.reply("Write your subsocial address: ")
		})
		scene.on('text', async (ctx) => {
			const message = ctx.message.text
			const isValidAccount = checkAddress(message, 28)
			if (isValidAccount[0]) {
				const telegramChat = await getTelegramChat(message, ctx.chat.id)
				console.log(telegramChat)
				if(!telegramChat) {
					await setTelegramData(message.toString(), ctx.chat.id)
				}
				await ctx.reply(`Thank you account confirmed`, mainMenuKeyboard)
				await ctx.scene.leave()
			} else {
				await ctx.reply(`Opps! Account is not valid:`)
				ctx.scene.reenter()
			}
		})
		return scene
	}
}
