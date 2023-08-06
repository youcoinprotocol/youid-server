import { authenticate } from '@feathersjs/authentication'

import type { Application } from '../../declarations'
import { IdentityService, getOptions } from './identities.class'
import { selfData } from '../../hooks/selfData'

export const identityPath = 'identities'
export const identityMethods = ['find', 'create'] as const

export * from './identities.class'

export const identity = (app: Application) => {
  app.use(identityPath, new IdentityService(getOptions(app)), {
    methods: identityMethods,
    events: []
  })

  app.service(identityPath).hooks({
    around: {
      all: [authenticate('jwt')]
    },
    before: {
      create: [selfData('userId')]
    }
  })
}

declare module '../../declarations' {
  interface ServiceTypes {
    [identityPath]: IdentityService
  }
}
