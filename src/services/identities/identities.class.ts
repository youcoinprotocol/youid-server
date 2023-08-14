// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex'

import type { Application } from '../../declarations'
import { BadRequest } from '@feathersjs/errors'
import { Reputation } from '../reputations/reputations.class'
import { randomUUID } from 'crypto'
import { Identity as SemaphoreIdentity } from '@semaphore-protocol/identity'
import { decryptAES, encryptAES, generateMD5Hash } from '../../helpers/encryption'
import { ethers } from 'ethers'

type Identity = {
  id: string
  reputationId: number
  userId: string
  commitment: string
  keys: string
  createdAt: string
  updatedAt: string
}
type IdentityData = Omit<Identity, 'createdAt' | 'updatedAt'>
type IdentityPatch = {}
type IdentityQuery = any

export type { Identity, IdentityData, IdentityPatch, IdentityQuery }

export interface IdentityParams extends KnexAdapterParams<IdentityQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class IdentityService<ServiceParams extends Params = IdentityParams> extends KnexService<
  Identity,
  IdentityData,
  IdentityParams,
  IdentityPatch
> {
  app: Application | null = null

  async setup(app: Application, path: string) {
    this.app = app
  }

  async create(data: IdentityData, params?: IdentityParams): Promise<Identity>
  async create(data: IdentityData[], params?: IdentityParams): Promise<Identity[]>
  async create(data: IdentityData | IdentityData[], params?: IdentityParams): Promise<Identity | Identity[]> {
    data = data as IdentityData
    if (!data.reputationId) {
      throw new BadRequest('Missing reputationId')
    }
    const password = (data as any).password ?? ''
    
    let reputation: Reputation | null = null
    try {
      reputation = await this.app!.service('reputations').get(data.reputationId)
    } catch (e) {}
    if (!reputation) {
      throw new BadRequest('Unknown reputation')
    }

    const wallet = await this.app!.service('wallets').get(params?.user?.walletId ?? '')
    if (!wallet) {
      throw new BadRequest('Please contact admin')
    }
    const ethWallet = new ethers.Wallet(decryptAES(wallet.privateKey, this.app!.get('appSecret')))

    const semaphoreIdentity = new SemaphoreIdentity(await ethWallet.signMessage(data.reputationId.toString()))
    const keys = encryptAES(semaphoreIdentity.toString(), password)
    
    const existingIdentities = await this.find({
      query: {
        userId: data.userId,
        reputationId: data.reputationId
      },
      paginate: false
    })
    let identity: Identity | null = null
    if (existingIdentities.length > 0) {
      identity = await this.patch(existingIdentities[0].id, {
        keys
      })
    } else {
      identity = await super.create({
        id: randomUUID(),
        userId: data.userId,
        reputationId: data.reputationId,
        commitment: semaphoreIdentity.commitment.toString(),
        keys
      })
    }

    return identity
  }
}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mysqlClient'),
    name: 'identities'
  }
}
