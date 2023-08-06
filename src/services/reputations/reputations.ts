import { authenticate } from '@feathersjs/authentication'

import type { Application } from '../../declarations'
import { ReputationService, getOptions } from './reputations.class'
import { disallow } from 'feathers-hooks-common'
export const reputationPath = 'reputations'
export const reputationMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export * from './reputations.class'

export const reputation = (app: Application) => {
  app.use(reputationPath, new ReputationService(getOptions(app)), {
    methods: reputationMethods,
    events: []
  })
  // Initialize hooks
  app.service(reputationPath).hooks({
    around: {
      all: [authenticate('jwt')]
    },
    before: {
      all: [],
      find: [],
      get: [],
      create: [disallow('external')],
      patch: [disallow('external')],
      remove: [disallow('external')]
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  })
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [reputationPath]: ReputationService
  }
}
