import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex'

import type { Application } from '../../declarations'
import { querySyntax } from '@feathersjs/schema'

type Otp = {
  id: number
  code: string
  identifier: string
  verified: boolean
  expiredAt: string
  createdAt: string
  updatedAt: string
}
type OtpData = Pick<Otp, 'code' | 'identifier' | 'expiredAt' | 'verified'>
type OtpPatch = Partial<OtpData>
type OtpQuery = any

export type { Otp, OtpData, OtpPatch, OtpQuery }
querySyntax
export interface OtpParams extends KnexAdapterParams<OtpQuery> {}

export class OtpService<ServiceParams extends Params = OtpParams> extends KnexService<
  Otp,
  OtpData,
  OtpParams,
  OtpPatch
> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mysqlClient'),
    name: 'otps'
  }
}
