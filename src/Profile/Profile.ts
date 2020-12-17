import { TelegrafContext } from 'telegraf/typings/context';
import { getAccountByChatId } from '../utils/OffchainUtils';
import { resolveSubsocialApi, api } from '../Substrate/subsocialConnect';
import { createMessageForProfile } from '../utils/utils';
import { formatBalance } from '@polkadot/util';
import { Markup } from 'telegraf';
import { appsUrl } from '../env';

const profileButton = (account: string) => Markup.inlineKeyboard([
	Markup.urlButton('View on site', `${appsUrl}/accounts/${account}`),
	Markup.urlButton('Edit profile', `${appsUrl}/accounts/edit`)
])

export const showProfile = async (ctx: TelegrafContext) => {
	const subsocial = await resolveSubsocialApi()

	const account = await getAccountByChatId(ctx.chat.id)

	const balance = await api.derive.balances.all(account)
	const profile = await subsocial.findProfile(account)
	const accountName = profile.content ? profile.content.name : account
	const { reputation, followers_count, following_accounts_count } = profile.struct

	console.log(followers_count.toString(), following_accounts_count.toString())
	const freeBalance = formatBalance(balance.freeBalance.toString())

	const message = createMessageForProfile(
		accountName,
		freeBalance,
		reputation.toString(),
		following_accounts_count.toString(),
		followers_count.toString()
	)
	ctx.telegram.sendMessage(ctx.chat.id, message, {reply_markup: profileButton(account)})
}