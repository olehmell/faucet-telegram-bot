import { SubsocialIpfsApi } from '@subsocial/api/ipfs'
import { SubsocialApi } from '@subsocial/api/subsocial'
import { SubsocialSubstrateApi } from '@subsocial/api/substrate'
import { Api } from '@subsocial/api/substrateConnect'
import { ipfsNodeUrl, offchainUrl, substrateUrl } from '../env';

export let subsocial: SubsocialApi
export let substrate: SubsocialSubstrateApi
export let ipfs: SubsocialIpfsApi

export const resolveSubsocialApi = async () => {

	if (!subsocial) {
		const api = await Api.connect(substrateUrl)
		subsocial = new SubsocialApi({
			substrateApi: api,
			ipfsNodeUrl,
			offchainUrl
		})

		substrate = subsocial.substrate
		ipfs = subsocial.ipfs
	}

	return subsocial
}
