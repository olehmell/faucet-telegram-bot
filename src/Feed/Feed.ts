import { PostId, SpaceId } from '@subsocial/types/substrate/interfaces';
import { resolveSubsocialApi } from '../Substrate/subsocialConnect';
import {
	createHrefForPost,
	createMessageForFeeds,
	createHrefForAccount,
	getAccountName,
	createHrefForSpace,
	getSpaceName
} from '../utils/utils';
import { Activity } from '../utils/OffchainUtils';

export const getPostPreview = async (feed: Activity): Promise<string> => {
	const subsocial = await resolveSubsocialApi()
	const { date, post_id, account, space_id } = feed
	const formatDate = new Date(date).toUTCString()

	const post = await subsocial.findPost({ id: post_id as unknown as PostId })
	const spaceId = post.struct.space_id
	const content = post.content.body

	const accountName = await getAccountName(account)
	const spaceName = await getSpaceName(space_id as unknown as SpaceId)

	const accountUrl = createHrefForAccount(account, accountName)
	const spaceUrl = createHrefForSpace(space_id, spaceName)
	const url = createHrefForPost(spaceId.toString(), post_id.toString(), content)

	return createMessageForFeeds(url, accountUrl, spaceUrl, formatDate)
}
