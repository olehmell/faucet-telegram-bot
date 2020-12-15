import { appsUrl } from '../env'
import { resolveSubsocialApi } from '../Substrate/subsocialConnect';

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
	return date + ' ' + account + " <b>" + msg + "</b> " + link + '\n'
}

export const getAccountName = async (account: string): Promise<string> => {
	const subsocial = await resolveSubsocialApi()
	const profile = await subsocial.findProfile(account)
	if (profile.content) {
		const name = profile.content.name
		return name
	}
	else return account

}
