import type { Application, HookContext } from '../../declarations'
import { UserService, getOptions } from './users.class'

export const userPath = 'users'
export const userMethods = ['find', 'get', 'create', 'patch', 'remove'] as const
import { disallow } from 'feathers-hooks-common'

export * from './users.class'

export const createWallet = async (context: HookContext) => {
  const user = context.result
  const wallet = await context.app.service('wallets').create({})
  await context.app.service('users').patch(user.id, { walletId: wallet.id })
}

export const user = (app: Application) => {

  app.use(userPath, new UserService(getOptions(app)), {
    methods: userMethods,
    events: []
  })

  app.service(userPath).hooks({
    before: {
      all: [disallow('external')]
    },
    after: {
      create: [createWallet]
    }
  })
}

declare module '../../declarations' {
  interface ServiceTypes {
    [userPath]: UserService
  }
}
