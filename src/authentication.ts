// For more information about this file see https://dove.feathersjs.com/guides/cli/authentication.html
import { AuthenticationResult, AuthenticationService, JWTStrategy } from '@feathersjs/authentication'
import type { Application } from './declarations'
import { OTPStrategy } from './helpers/authentication'
import { Params } from '@feathersjs/feathers'

declare module './declarations' {
  interface ServiceTypes {
    authentication: AuthenticationService
  }
}

class MyAuthService extends AuthenticationService {
  async getPayload(authResult: AuthenticationResult, params: Params) {
    const payload = await super.getPayload(authResult, params)
    const { user } = authResult

    payload.username = user.username

    return payload
  }
}

export const authentication = (app: Application) => {
  const authentication = new MyAuthService(app)

  authentication.register('jwt', new JWTStrategy())
  authentication.register('otp', new OTPStrategy())

  app.use('authentication', authentication)
}
