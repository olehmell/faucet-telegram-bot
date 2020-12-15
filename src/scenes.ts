import { mainMenuKeyboard } from './index';
import { setTelegramData } from './utils/OffchainUtils';
import { Keyboard } from 'telegram-keyboard';
const Scene = require('telegraf/scenes/base')

export class SceneGenerator {
	getBalanceScene() {
		const scene = new Scene('address')
		scene.enter(async (ctx) => {
			await ctx.reply("Write your subsocial address: ", Keyboard.make(['Back']).reply())
		})
		scene.on('text', async (ctx) => {
			const message = ctx.message.text
			try {
				await setTelegramData(message, ctx.chat.id)
				await ctx.reply(`Thank you account confirmed`, mainMenuKeyboard)
				await ctx.scene.leave()
			} catch (err) {
				await ctx.reply(`Opps! Some problem: ${err}`, Keyboard.make(['Back']).reply())
				ctx.scene.reenter()
			}
		})
		scene.on("Back", () => {
			scene.leave()
		})
		return scene
	}
}
