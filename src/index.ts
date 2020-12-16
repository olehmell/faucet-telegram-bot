import { Keyboard } from 'telegram-keyboard'
import { SceneGenerator } from './scenes';
import { getNotifications, getAccountByChatId, getNewsFeed } from './utils/OffchainUtils';
import { TOKEN } from './env';
import { getPostPreview } from './Feed/Feed';
import { Markup } from 'telegraf';
import { TelegrafContext } from 'telegraf/typings/context';
import { createNotificationMessage } from './Notifications/Notifications';
import { resloveWebSocketConnection } from './ws';

const Telegraf = require('telegraf')
const {
  Stage,
  session
} = Telegraf

export const bot = new Telegraf(TOKEN)

// bot.use(Telegraf.log())

let notifOffset = 0
let feedOffset = 0

const loadMoreNotif = Markup.inlineKeyboard([
  Markup.callbackButton('Load more', 'loadMoreNotifs'),
])

const loadMoreFeed = Markup.inlineKeyboard([
  Markup.callbackButton('Load more', 'loadMoreFeeds'),
])

export const mainMenuKeyboard = Keyboard.make([
  ['📰 My feed', '🔔 My notifications'],
  ['👤 Profile', '⚙️ Settings']
]).reply()

const scenesGen = new SceneGenerator()
const getBalance = scenesGen.getBalanceScene()

const stage = new Stage([getBalance])

bot.use(session())
bot.use(stage.middleware())

bot.start(async (ctx) => {
  await ctx.telegram.sendMessage(ctx.chat.id, 'Hi in subsocial telegram bot')
  return ctx.scene.enter('address')
})

resloveWebSocketConnection()

bot.hears('🔔 My notifications', async (ctx) => {
  notifOffset = 0
  await showNotification(ctx)
})

bot.action('loadMoreNotifs', async (ctx) => {
  return await showNotification(ctx)
})

bot.hears('📰 My feed', async (ctx: TelegrafContext) => {
  notifOffset = 0
  return await showFeed(ctx)
})

bot.action('loadMoreFeeds', async (ctx) => {
  return await showFeed(ctx)
})

bot.launch()

const showNotification = async (ctx: TelegrafContext) => {
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
}

const showFeed = async (ctx: TelegrafContext) => {
  const account = await getAccountByChatId(ctx.chat.id)
  if (account) {
    const feeds = await getNewsFeed(account, feedOffset, 5)
    if (feeds.length) {
      for (let i = 0; i < feeds.length; i++) {
        const feed = feeds[i]
        if (i == feeds.length - 1)
          await ctx.telegram.sendMessage(ctx.chat.id, await getPostPreview(feed), {
            parse_mode: 'HTML',
            reply_markup: loadMoreFeed
          })
        else
          await ctx.telegram.sendMessage(ctx.chat.id, await getPostPreview(feed), { parse_mode: 'HTML' })
      }
      feedOffset += 5
    } else {
      feedOffset = 0
    }
  }
}