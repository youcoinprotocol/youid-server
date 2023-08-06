import type { Application } from '../../../declarations'
import { AuthOtpService, getOptions } from './otp.class'

export const authOtpPath = 'authentication/otps'
export const authOtpMethods = ['create'] as const

export * from './otp.class'

export const authOtp = (app: Application) => {
  app.use(authOtpPath, new AuthOtpService(getOptions(app)), {
    methods: authOtpMethods,
    events: []
  })
}

declare module '../../../declarations' {
  interface ServiceTypes {
    [authOtpPath]: AuthOtpService
  }
}
