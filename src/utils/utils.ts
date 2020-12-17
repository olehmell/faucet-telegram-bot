import { appsUrl } from '../env'
import { resolveSubsocialApi } from '../Substrate/subsocialConnect';
import { SpaceId } from '@subsocial/types/substrate/interfaces';
import { TelegrafContext } from 'telegraf/typings/context';
import { message, settingsKeyboard } from '../Settings/settings';
import { updateTelegramChat, getTelegramChat, getAccountByChatId } from './OffchainUtils';

export type Type = 'notification' | 'feed'

export const createHrefForPost = (spaceId: string, postId: string, name: string) => {
	return `<a href="${appsUrl}/${spaceId}/${postId}">${name}</a>`
}

export const createHrefForSpace = (spaceId: string, name: string) => {
	return `<a href="${appsUrl}/${spaceId}">${name}</a>`
}

export const createHrefForAccount = (followingId: string, name: string) => {
	return `<a href="${appsUrl}/accounts/${followingId}">${name}</a>`
}

export const createMessageForNotifs = (date: string, account: string, msg: string, link: string) => {
	return account + " <b>" + msg + "</b> " + link + "\n" + date
}

export const createMessageForFeeds = (link: string, account: string, spaceName: string, date: string) => {
	return link + "\n" + "Posted by " + account + " in space " + spaceName + "\n" + date
}

export const createMessageForProfile = (
	accountName: string,
	address: string,
	balance: string,
	reputation: string,
	followings: string,
	followers: string
) => {
	return "Name: " + accountName
		+ "\nAddress: " + address
		+ "\nBalance: " + balance
		+ "\nReputation: " + reputation
		+ "\nMy followings: " + followings
		+ "\nMy followers: " + followers
}

export const getAccountName = async (account: string): Promise<string> => {
	const subsocial = await resolveSubsocialApi()
	const profile = await subsocial.findProfile(account)
	if (profile?.content) {
		const name = profile.content.name
		return name
	}
	else return account
}

export const getSpaceName = async (spaceId: SpaceId): Promise<string> => {
	const subsocial = await resolveSubsocialApi()
	const space = await subsocial.findSpace({ id: spaceId })
	if (space.content) {
		const name = space.content.name
		return name
	}
	else return ''
}

export const manageSettings = async (ctx: TelegrafContext, type: Type) => {
	const messageId = ctx.update.callback_query.message.message_id
	const account = await getAccountByChatId(ctx.chat.id)
	if (!account) return

	const telegramChat = await getTelegramChat(account, ctx.chat.id)
	let { push_notifs, push_feeds } = telegramChat

	if(type == "notification") push_notifs = !push_notifs
	else push_feeds = !push_feeds

	const updated = await updateTelegramChat(account, ctx.chat.id, push_notifs, push_feeds)

	ctx.telegram.editMessageText(ctx.chat.id, messageId, '', message, { reply_markup: settingsKeyboard(updated.push_notifs, updated.push_feeds) })
}