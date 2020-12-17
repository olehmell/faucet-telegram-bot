import { w3cwebsocket as W3CWebSocket, IMessageEvent } from "websocket";
import { offchainWs } from './env';
import { newLogger } from '@subsocial/utils';
import { Activity, getAccountByChatId, getTelegramChat } from './utils/OffchainUtils';
import { createNotificationMessage } from './Notifications/Notifications';
import { bot } from './index';
import { getPostPreview } from './Feed/Feed';
import { Type } from './utils/utils';

type OffchainMessage = {
	activity: Activity,
	chatId: number,
	type: Type
}
const log = newLogger("Telegram WS")

export let socket: W3CWebSocket

export const resloveWebSocketConnection = () => {
	if (!socket) {
		socket = new W3CWebSocket(offchainWs)
	}
	return socket
}

resloveWebSocketConnection()
socket.onopen = () => {
	log.info('Connected to Notifications Counter Web Socket')
	socket.send("hello");
	socket.onerror = (error) => { log.error('Telegram Websocket Error:', error) }
};
socket.onclose = () => {
};
socket.onmessage = async (msg: IMessageEvent) => {
	const { activity, chatId, type } = JSON.parse(msg.data) as OffchainMessage
	const account = await getAccountByChatId(chatId)
	if (!account) return

	const { push_notifs, push_feeds } = await getTelegramChat(account, chatId)

	if (type === 'notification' && push_notifs) {
		const notifMessage = await createNotificationMessage([activity])
		bot.telegram.sendMessage(Number(chatId), notifMessage[0], { parse_mode: 'HTML', disable_web_page_preview: true })
	} else if (type == 'feed' && push_feeds) {
		const feedMessage = await getPostPreview(activity)
		bot.telegram.sendMessage(chatId, feedMessage, { parse_mode: 'HTML' })
	}
	log.info('Received a new value for unread notifications:', chatId)
}