import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex'
import { ethers } from 'ethers'
import type { Application } from '../../declarations'
import { encryptAES } from '../../helpers/encryption'
import { randomUUID } from 'crypto'

type Wallet = {
  id: string
  address: string
  privateKey: string
  createdAt: string
  updatedAt: string
}
type WalletData = {}
type WalletPatch = Partial<WalletData>
type WalletQuery = any

export type { Wallet, WalletData, WalletPatch, WalletQuery }

export interface WalletParams extends KnexAdapterParams<WalletQuery> {}

export class WalletService<ServiceParams extends Params = WalletParams> extends KnexService<
  Wallet,
  WalletData,
  WalletParams,
  WalletPatch
> {
  app: Application | null = null

  async setup(app: Application, path: string) {
    this.app = app
  }

  async create(data: WalletData, params?: WalletParams): Promise<Wallet>
  async create(data: WalletData[], params?: WalletParams): Promise<Wallet[]>
  async create(data: WalletData | WalletData[], params?: WalletParams): Promise<Wallet | Wallet[]> {
    const wallet = ethers.Wallet.createRandom()
    const address = wallet.address
    const privateKey = wallet.privateKey
    return await super.create({
      id: randomUUID(),
      address,
      privateKey: encryptAES(privateKey, this.app!.get('appSecret'))
    })
  }
}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mysqlClient'),
    name: 'wallets'
  }
}
