"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const telegraf_1 = require("telegraf");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");
const substrateConnect_1 = require("@subsocial/api/substrateConnect");
const registry_1 = require("@subsocial/types/substrate/registry");
const util_1 = require("@polkadot/util");
const AccountId_1 = require("@polkadot/types/generic/AccountId");
let api;
require('dotenv').config();
const TOKEN = process.env.TOKEN;
const SUBSTRATE_URL = process.env.SUBSTRATE_URL;
const bot = new telegraf_1.default(TOKEN);
bot.use(telegraf_1.default.log());
bot.command('start', (ctx) => {
    return ctx.reply('Share your phone:', Extra.markup((markup) => {
        return markup.resize()
            .keyboard([
            markup.contactRequestButton('Send contact')
        ]);
    }));
});
bot.hears(/[A-Za-z\d@$!%*?&_-]{48,48}$/, (ctx) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const message = ctx.message.text;
    try {
        const address = new AccountId_1.default(registry_1.registry, message);
        console.log('Address:', address);
        const ballance = yield api.derive.balances.all(address);
        ctx.reply(`Your balance: ${util_1.formatBalance(ballance.freeBalance.toString())}`);
    }
    catch (err) {
        ctx.reply(`Opps! Some problem: ${err}`);
    }
}));
bot.on('contact', ctx => ctx.reply('Thanks. What is your account address?', Extra.markup(Markup.keyboard([])
    .oneTime()
    .resize()
    .extra())));
bot.action(/.+/, (ctx) => {
    return ctx.answerCbQuery(`Oh, ${ctx.match[0]}! Great choice`);
});
const main = () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    api = yield substrateConnect_1.Api.connect(SUBSTRATE_URL);
    bot.launch();
});
main();
//# sourceMappingURL=index.js.map