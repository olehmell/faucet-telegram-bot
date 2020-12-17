import { Keyboard } from 'telegram-keyboard'
import { SceneGenerator } from './scenes';
import { TOKEN } from './env';
import { showFeed } from './Feed/Feed';
import { TelegrafContext } from 'telegraf/typings/context';
import { showNotification } from './Notifications/Notifications';
import { resloveWebSocketConnection } from './ws';
import { showProfile } from './Profile/Profile';
import { showSettings } from './Settings/settings';
import { manageSettings } from './utils/utils';

const Telegraf = require('telegraf')
const {
  Stage,
  session
} = Telegraf

export const bot = new Telegraf(TOKEN)

// bot.use(Telegraf.log())

let notifOffset = 0
let feedOffset = 0

export const mainMenuKeyboard = Keyboard.make([
  ['📰 Feed', '🔔 Notifications'],
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

bot.hears('🔔 Notifications', async (ctx) => {
  notifOffset = 0
  notifOffset = await showNotification(ctx, notifOffset)
})

bot.action('loadMoreNotifs', async (ctx) => {
  notifOffset = await showNotification(ctx, notifOffset)
})

bot.hears('📰 Feed', async (ctx: TelegrafContext) => {
  feedOffset = 0
  feedOffset = await showFeed(ctx, feedOffset)
})

bot.action('loadMoreFeeds', async (ctx) => {
  feedOffset = await showFeed(ctx, feedOffset)
})

bot.hears('👤 Profile', async (ctx) => {
  await showProfile(ctx)
})

bot.hears('⚙️ Settings', async (ctx) => {
  await showSettings(ctx)
})

bot.action('pushFeeds', async (ctx: TelegrafContext) => {
  await manageSettings(ctx, 'feed')
})

bot.action('pushNotifs', async (ctx: TelegrafContext) => {
  await manageSettings(ctx, 'notification')
})


bot.launch()