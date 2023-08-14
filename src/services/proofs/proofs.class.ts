// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex'

import type { Application } from '../../declarations'
import { randomUUID } from 'crypto'

type Proof = {
  id: string
  code: string
  bundle: string
  createdAt: string
  updatedAt: string
}
type ProofData = Omit<Proof, 'createdAt' | 'updatedAt'>
type ProofPatch = Partial<Proof>
type ProofQuery = any

export type { Proof, ProofData, ProofPatch, ProofQuery }

export interface ProofParams extends KnexAdapterParams<ProofQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class ProofService<ServiceParams extends Params = ProofParams> extends KnexService<
  Proof,
  ProofData,
  ProofParams,
  ProofPatch
> {
  async create(data: ProofData, params?: ProofParams | undefined): Promise<Proof>
  async create(data: ProofData[], params?: ProofParams | undefined): Promise<Proof[]>
  async create(data: ProofData | ProofData[], params?: ProofParams | undefined): Promise<Proof | Proof[]> {
    data = data as ProofData
    data.id = randomUUID().toString()
    return super.create(data, params)
  }
}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mysqlClient'),
    name: 'proofs'
  }
}
