import { Keyboard } from 'telegram-keyboard'
import { SceneGenerator } from './scenes';
import { getNotifications, getAccountByChatId, getNewsFeed } from './utils/OffchainUtils';
import { TOKEN } from './env';
import { getPostPreview } from './Feed/Feed';
import { Markup } from 'telegraf';
import { TelegrafContext } from 'telegraf/typings/context';
import { createNotificationMessage } from './Notifications/Notifications';
const Telegraf = require('telegraf')
const {
  Stage,
  session
} = Telegraf

const bot = new Telegraf(TOKEN)

const scenesGen = new SceneGenerator()
const getBalance = scenesGen.getBalanceScene()

// bot.use(Telegraf.log())

const stage = new Stage([getBalance])

bot.use(session())
bot.use(stage.middleware())


let offset = 0

const loadMore = Markup.inlineKeyboard([
  Markup.callbackButton('Load more', 'loadMore'),
]).extra()

export const mainMenuKeyboard = Keyboard.make([
  ['🔔 My notifications', '📰 My feed']
]).reply()

const showNotification = async (ctx: TelegrafContext) => {
  const account = await getAccountByChatId(ctx.chat.id)
  const notifs = await getNotifications(account, offset, 5)
  const notifsMessage = await createNotificationMessage(notifs)
  if (notifsMessage.length) {
    for (const notification of notifsMessage) {
      await ctx.telegram.sendMessage(ctx.chat.id, notification, { parse_mode: 'HTML' })
    }
    offset += 5
    ctx.reply('Load more notification', loadMore)
  } else {
    offset = 0
    ctx.reply("That's all folks")
  }
}

bot.start((ctx) => {
  ctx.reply('Hi in subsocial telegram bot')
  ctx.scene.enter('address')
})

bot.hears('🔔 My notifications', async (ctx) => {
  await showNotification(ctx)
})

bot.action('loadMore', async (ctx) => {
  await showNotification(ctx)
})

bot.hears('📰 My feed', async (ctx) => {
  const account = await getAccountByChatId(ctx.chat.id)
  const feed = await getNewsFeed(account, 0, 10)
  feed.map(async (x) => ctx.telegram.sendMessage(ctx.chat.id, await getPostPreview(x.post_id), { parse_mode: 'HTML' }))
})

// bot.hears('Back', (ctx) => {
//   return ctx.reply('Simple Keyboard', mainMenuKeyboard)
// })

bot.launch()