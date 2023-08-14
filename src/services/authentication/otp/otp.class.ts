// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#custom-services
import type { Id, NullableId, Params, ServiceInterface } from '@feathersjs/feathers'

import type { Application } from '../../../declarations'
import moment from 'moment'
import { TooManyRequests } from '@feathersjs/errors'
import { randomDigits } from '../../../helpers'
import fs from 'fs'
import handlebars from 'handlebars'

type AuthOtp = {
  identifier?: string
  res?: string
}
type AuthOtpData = { identifier: string }
type AuthOtpPatch = AuthOtp
type AuthOtpQuery = any

export type { AuthOtp, AuthOtpData, AuthOtpPatch, AuthOtpQuery }

export interface AuthOtpServiceOptions {
  app: Application
}

export interface AuthOtpParams extends Params<AuthOtpQuery> {}

// This is a skeleton for a custom service class. Remove or add the methods you need here
export class AuthOtpService<ServiceParams extends AuthOtpParams = AuthOtpParams>
  implements ServiceInterface<AuthOtp, AuthOtpData, ServiceParams, AuthOtpPatch>
{
  app: Application
  constructor(public options: AuthOtpServiceOptions) {
    this.app = options.app
  }

  async create(data: AuthOtpData, params?: ServiceParams): Promise<Partial<AuthOtp>> {
    const service = this.app.service('otps')
    // Find existing otp record
    const expiresMinutes: number = this.app.get('authentication').otp.expriesIn

    const { identifier } = data
    const oldRecordRes = await service.find({
      query: {
        $limit: 1,
        identifier
      }
    })
    const code = randomDigits(6)
    if (oldRecordRes.total > 0) {
      const record = oldRecordRes.data.shift()
      const duration = moment().diff(moment(record?.expiredAt), 'minutes')

      if (!record?.verified && duration < -expiresMinutes * 0.5) {
        throw new TooManyRequests()
      }
      const data = {
        code,
        expiredAt: moment().add(expiresMinutes, 'minutes').format('YYYY-MM-DD HH:mm:ss'),
        verified: false
      }
      await service.patch(record!.id, data)
    } else {
      await service.create({
        identifier,
        code,
        verified: false,
        expiredAt: moment().add(expiresMinutes, 'minutes').format('YYYY-MM-DD HH:mm:ss')
      })
    }

    const tplData = fs.readFileSync(`${this.app.get('resources')}emails/otp.html`, 'utf8')
    const template = handlebars.compile(tplData)
    const mailbody = template({
      code
    })

    const email = {
      to: identifier,
      subject: 'Your YOUID verification code',
      html: mailbody,
      from: this.app.get('sendgrid').sender
    }
    await this.app.service('mailer').create(email)

    return {
      res: 'ok'
    }
  }
}

export const getOptions = (app: Application) => {
  return { app }
}
