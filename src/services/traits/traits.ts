import { authenticate } from '@feathersjs/authentication'

import type { Application } from '../../declarations'
import { TraitService, getOptions } from './traits.class'
import { selfQuery } from '../../hooks/self-query'
import { disallow } from 'feathers-hooks-common'

export const traitPath = 'traits'
export const traitMethods = ['find', 'create', 'remove'] as const

export * from './traits.class'

export const trait = (app: Application) => {
  app.use(traitPath, new TraitService(getOptions(app)), {
    methods: traitMethods,
    events: []
  })

  app.service(traitPath).hooks({
    around: {
      all: [authenticate('jwt')]
    },
    before: {
      create: [disallow('external')],
      remove: [disallow('external')],
      find: [selfQuery('userId')]
    }
  })
}

declare module '../../declarations' {
  interface ServiceTypes {
    [traitPath]: TraitService
  }
}
