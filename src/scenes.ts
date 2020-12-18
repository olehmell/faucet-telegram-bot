import { mainMenuKeyboard } from './index';
import { setTelegramData, changeCurrentAccount } from './utils/OffchainUtils';
import { checkAddress } from '@polkadot/util-crypto';
const Scene = require('telegraf/scenes/base')

export class SceneGenerator {
	getBalanceScene() {
		const scene = new Scene('address')
		scene.enter(async (ctx) => {
			await ctx.reply("Write your address on Subsocial: ")
		})
		scene.on('text', async (ctx) => {
			const chatId = ctx.chat.id
			const message = ctx.message.text
			const isValidAccount = !!checkAddress(message, 28)[0]

			if (isValidAccount) {
				await setTelegramData(message.toString(), chatId)
				await changeCurrentAccount(message.toString(), chatId)
				await ctx.reply(`Thank you account confirmed`, mainMenuKeyboard)
				ctx.chat.first_name = message
				await ctx.scene.leave()
			} else {
				await ctx.reply(`Opps! Account is not valid:`)
				ctx.scene.reenter()
			}
		})
		return scene
	}
}
