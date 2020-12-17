import { PostId, SpaceId } from '@subsocial/types/substrate/interfaces';
import { EventsName } from '@subsocial/types';
import { Activity, getAccountByChatId, getNotifications } from '../utils/OffchainUtils';
import message from './message';
import { resolveSubsocialApi } from '../Substrate/subsocialConnect';
import { getAccountName, createHrefForAccount, createMessageForNotifs, createHrefForSpace, createHrefForPost } from '../utils/utils';
import { Markup } from 'telegraf';
import { mainMenuKeyboard } from '../index';
import { TelegrafContext } from 'telegraf/typings/context';

const loadMoreNotif = Markup.inlineKeyboard([
	Markup.callbackButton('Load more', 'loadMoreNotifs'),
  ])

export const createNotificationMessage = async (activities: Activity[]) => {
	let res: string[] = []
	for (let index = 0; index < activities.length; index++) {
		const activity = activities[index];
		const str = message.notifications[activity.event as EventsName]
		res.push(await getActivityPreview(activity, str))
	}
	return res
}

const getActivityPreview = async (activity: Activity, msg: string): Promise<string> => {
	const { account, event, space_id, post_id, comment_id, following_id, date } = activity
	const eventName = event as EventsName

	switch (eventName) {
		case 'AccountFollowed': return getAccountPreview(account, following_id, msg, date)
		case 'SpaceFollowed': return getSpacePreviewWithMaps(account, space_id, msg, date)
		case 'SpaceCreated': return getSpacePreviewWithMaps(account, space_id, msg, date)
		case 'CommentCreated': return getCommentPreviewWithMaps(account, comment_id, msg, date)
		case 'CommentReplyCreated': return getCommentPreviewWithMaps(account, comment_id, msg, date)
		case 'PostShared': return getPostPreviewWithMaps(account, post_id, msg, date)
		case 'CommentShared': return getCommentPreviewWithMaps(account, comment_id, msg, date)
		case 'PostReactionCreated': return getPostPreviewWithMaps(account, post_id, msg, date)
		case 'CommentReactionCreated': return getCommentPreviewWithMaps(account, comment_id, msg, date)
		case 'PostCreated': return getPostPreviewWithMaps(account, post_id, msg, date)
		default: return undefined
	}
}

const getAccountPreview = async (account: string, following_id: string, msg: string, date: string): Promise<string> => {
	const formatDate = new Date(date).toUTCString()

	const followingName = await getAccountName(following_id)
	const accountName = await getAccountName(account)

	const followingUrl = createHrefForAccount(following_id, followingName)
	const accountUrl = createHrefForAccount(account, accountName)
	return createMessageForNotifs(formatDate, accountUrl, msg, followingUrl)
}

const getSpacePreviewWithMaps = async (account: string, spaceId: string, msg: string, date: string): Promise<string> => {
	const subsocial = await resolveSubsocialApi()
	const formatDate = new Date(date).toUTCString()
	const space = await subsocial.findSpace({ id: spaceId as unknown as SpaceId })
	const content = space.content.name

	const accountName = await getAccountName(account)

	const url = createHrefForSpace(spaceId.toString(), content)

	return createMessageForNotifs(formatDate, createHrefForAccount(account, accountName), msg, url)
}

const getCommentPreviewWithMaps = async (account: string, comment_id: string, msg: string, date: string): Promise<string> => {
	const subsocial = await resolveSubsocialApi()
	const formatDate = new Date(date).toUTCString()

	const postDetails = await subsocial.findPostWithSomeDetails({ id: comment_id as unknown as PostId, withSpace: true })
	const postId = postDetails.post.struct.id
	const spaceId = postDetails.space.struct.id
	const content = postDetails.ext.post.content.body

	const accountName = await getAccountName(account)

	const url = createHrefForPost(spaceId.toString(), postId.toString(), content)

	return createMessageForNotifs(formatDate, createHrefForAccount(account, accountName), msg, url)
}

const getPostPreviewWithMaps = async (account: string, postId: string, msg: string, date: string): Promise<string> => {
	const subsocial = await resolveSubsocialApi()
	const formatDate = new Date(date).toUTCString()

	const post = await subsocial.findPost({ id: postId as unknown as PostId })
	const spaceId = post.struct.space_id
	const content = post.content.body

	const accountName = await getAccountName(account)

	const url = createHrefForPost(spaceId.toString(), postId.toString(), content)

	return createMessageForNotifs(formatDate, createHrefForAccount(account, accountName), msg, url)
}

export const showNotification = async (ctx: TelegrafContext, notifOffset: number) => {
	const account = await getAccountByChatId(ctx.chat.id)
	if (account) {
	  const notifs = await getNotifications(account, notifOffset, 5)
	  const notifsMessage = await createNotificationMessage(notifs)

	  if (notifsMessage.length) {
		for (let i = 0; i < notifsMessage.length; i++) {
		  const notification = notifsMessage[i]

		  if (i == notifsMessage.length - 1)
			await ctx.telegram.sendMessage(ctx.chat.id, notification, {
			  parse_mode: 'HTML',
			  disable_web_page_preview: true,
			  reply_markup: loadMoreNotif
			})
		  else
			await ctx.telegram.sendMessage(ctx.chat.id, notification, {
			  parse_mode: 'HTML',
			  disable_web_page_preview: true
			})
		}
		notifOffset += 5
	  } else {
		notifOffset = 0
		ctx.reply("That's all folks", mainMenuKeyboard)
	  }
	}
	return notifOffset
  }