import type { Application } from '../../declarations'
import { OtpService, getOptions } from './otps.class'
import { disallow } from 'feathers-hooks-common'

export const otpPath = 'otps'
export const otpMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export * from './otps.class'

export const otp = (app: Application) => {
  app.use(otpPath, new OtpService(getOptions(app)), {
    methods: otpMethods,
    events: []
  })

  app.service(otpPath).hooks({
    before: {
      all: [disallow('external')]
    }
  })
}

declare module '../../declarations' {
  interface ServiceTypes {
    [otpPath]: OtpService
  }
}
