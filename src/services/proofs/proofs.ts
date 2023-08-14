import { authenticate } from '@feathersjs/authentication'

import type { Application } from '../../declarations'
import { ProofService, getOptions } from './proofs.class'
import { selfQuery } from '../../hooks/self-query'
import { selfData } from '../../hooks/self-data'

export const proofPath = 'proofs'
export const proofMethods = ['find', 'get', 'create'] as const

export * from './proofs.class'

export const proof = (app: Application) => {
  app.use(proofPath, new ProofService(getOptions(app)), {
    methods: proofMethods,
    events: []
  })

  app.service(proofPath).hooks({
    around: {
      all: []
    },
    before: {
      all: [],
      find: [authenticate('jwt'), selfQuery('userId')],
      get: [],
      create: [authenticate('jwt'), selfData('userId')]
    }
  })
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [proofPath]: ProofService
  }
}
