import { SubsocialApi, newSubsocialApi } from '@subsocial/api'
import { ipfsReadOnly, offchainUrl, substrateUrl } from '../utils/env'

export let subsocial: SubsocialApi

export const resolveSubsocialApi = async () => {
  if (!subsocial) {
    subsocial = await newSubsocialApi({
      ipfsNodeUrl: ipfsReadOnly,
      offchainUrl,
      substrateNodeUrl: substrateUrl
    })
  }

  return subsocial
}
