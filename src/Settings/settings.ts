import { TelegrafContext } from 'telegraf/typings/context';
import { Markup } from 'telegraf';
import { getAccountByChatId, getTelegramChat } from '../utils/OffchainUtils';

export const message = 'Turn on/off notifications or feed push'

export const settingsKeyboard = (isOnNotifs: boolean, isOnFeed: boolean) => {
	const checkMarkFeeds = isOnFeed ? '✅ Live feed enabled' : '❌ Live feed disabled'
	const checkMarkNotifs = isOnNotifs ? '✅ Live notifications enabled' : '❌ Live notifications disabled'

	return Markup.inlineKeyboard([
		Markup.callbackButton(`${checkMarkFeeds}`, 'pushFeeds'),
		Markup.callbackButton(`${checkMarkNotifs}`, 'pushNotifs')
	])
}

export const showSettings = async (ctx: TelegrafContext) => {
	const account = await getAccountByChatId(ctx.chat.id)
	if (!account) return

	const telegramChat = await getTelegramChat(account, ctx.chat.id)
	const { push_notifs, push_feeds } = telegramChat

	ctx.telegram.sendMessage(ctx.chat.id, message, { reply_markup: settingsKeyboard(push_notifs, push_feeds) })
}