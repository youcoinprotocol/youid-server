// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex'

import type { Application } from '../../declarations'

type Trait = {
  id: string
  userId: string
  groupId: number
  blockNumber: number
  createdAt: string
  updatedAt: string
}
type TraitData = Omit<Trait, 'createdAt' | 'updatedAt'>
type TraitPatch = {}
type TraitQuery = any

export type { Trait, TraitData, TraitPatch, TraitQuery }

export interface TraitParams extends KnexAdapterParams<TraitQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class TraitService<ServiceParams extends Params = TraitParams> extends KnexService<
  Trait,
  TraitData,
  TraitParams,
  TraitPatch
> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mysqlClient'),
    name: 'traits',
    multi: ['remove']
  }
}
