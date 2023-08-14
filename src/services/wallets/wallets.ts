// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import type { Application } from '../../declarations'
import { WalletService, getOptions } from './wallets.class'
import { disallow } from 'feathers-hooks-common'
export const walletPath = 'wallets'
export const walletMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export * from './wallets.class'

export const wallet = (app: Application) => {
  app.use(walletPath, new WalletService(getOptions(app)), {
    methods: walletMethods,
    events: []
  })

  app.service(walletPath).hooks({
    before: {
      all: [disallow('external')]
    }
  })
}

declare module '../../declarations' {
  interface ServiceTypes {
    [walletPath]: WalletService
  }
}
