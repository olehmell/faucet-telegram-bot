import Telegraf from 'telegraf'
import * as Extra from 'telegraf/extra'
import * as Markup from 'telegraf/markup'
import { Api } from '@subsocial/api/substrateConnect';
import { registry } from '@subsocial/types/substrate/registry'
import { ApiPromise } from '@polkadot/api';
import { formatBalance } from '@polkadot/util';
import AccountId from '@polkadot/types/generic/AccountId';

let api: ApiPromise;

require('dotenv').config()

const TOKEN = process.env.TOKEN
const SUBSTRATE_URL = process.env.SUBSTRATE_URL
const bot = new Telegraf(TOKEN)

bot.use(Telegraf.log())

bot.command('start', (ctx) => {
  return ctx.reply('Share your phone:', Extra.markup((markup) => {
    return markup.resize()
      .keyboard([
        markup.contactRequestButton('Send contact')
      ])
  }))
})

bot.hears(/[A-Za-z\d@$!%*?&_-]{48,48}$/, async ctx => {
  const message = ctx.message.text
  try {
    const address = new AccountId(registry, message)
    console.log('Address:', address)
    const ballance = await api.derive.balances.all(address)
    ctx.reply(`Your balance: ${formatBalance(ballance.freeBalance.toString())}`)
  } catch (err) {
    ctx.reply(`Opps! Some problem: ${err}`)
  }  
})

bot.on('contact', ctx => ctx.reply('Thanks. What is your account address?', Extra.markup(
     Markup.keyboard([])
      .oneTime()
      .resize()
      .extra()
  )))

const main = async () => {
  api = await Api.connect(SUBSTRATE_URL)
  bot.launch()
}

main()