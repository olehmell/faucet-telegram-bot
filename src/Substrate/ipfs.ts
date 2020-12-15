import { ipfsNodeUrl } from '../env'

const getPath = (cid: string) => `ipfs/${cid}`

export const resolveIpfsUrl = (cid: string) => {
  try {
    return `${ipfsNodeUrl}/${getPath(cid)}`
  } catch (err) {
    return cid
  }
}