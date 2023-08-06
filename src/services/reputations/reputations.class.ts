import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex'

import type { Application } from '../../declarations'

type Reputation = any
type ReputationData = any
type ReputationPatch = any
type ReputationQuery = any

export type { Reputation, ReputationData, ReputationPatch, ReputationQuery }

export interface ReputationParams extends KnexAdapterParams<ReputationQuery> {}


export class ReputationService<ServiceParams extends Params = ReputationParams> extends KnexService<
  Reputation,
  ReputationData,
  ReputationParams,
  ReputationPatch
> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mysqlClient'),
    name: 'reputations'
  }
}
