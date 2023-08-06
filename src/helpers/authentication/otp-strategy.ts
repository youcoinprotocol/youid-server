import { Params, Service } from '@feathersjs/feathers'
import { AuthenticationBaseStrategy, AuthenticationResult } from '@feathersjs/authentication'
import { Application } from '../../declarations'
import moment from 'moment'
import { NotAuthenticated } from '@feathersjs/errors'

export class OTPStrategy extends AuthenticationBaseStrategy {
  async getEntity(username: string, params: Params) {
    const userService = (this.app as Application)!.service('users')
    const user = await userService.findOrCreate(username)
    if (!user) {
      throw new NotAuthenticated('User not found')
    }
    delete user.walletId
    return user
  }

  get configuration() {
    const authConfig = this.app!.get('authentication')
    const config = super.configuration || {}

    return {
      service: authConfig.service,
      entity: authConfig.entity,
      ...config
    }
  }

  async authenticate(authentication: AuthenticationResult, params: Params) {
    const { entity } = this.configuration
    const { identifier, code } = authentication
    const app = this.app! as Application
    const service = app.service('otps')
    const otpRes = await service.find({
      query: {
        code,
        identifier,
        verified: false,
        expiredAt: {
          $gt: moment().format('YYYY-MM-DD HH:mm:ss')
        }
      }
    })

    if (!otpRes.total) {
      throw new NotAuthenticated()
    }

    await service.patch(otpRes.data[0].id, { verified: true })

    return {
      authentication: { strategy: this.name },
      [entity]: await this.getEntity(identifier, params)
    }
  }
}
