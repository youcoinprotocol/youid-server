// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import type { Application } from '../../declarations'
import { GroupService, getOptions } from './groups.class'

export const groupPath = 'groups'
export const groupMethods = ['get'] as const

export * from './groups.class'

// A configure function that registers the service and its hooks via `app.configure`
export const group = (app: Application) => {
  // Register our service on the Feathers application
  app.use(groupPath, new GroupService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: groupMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(groupPath).hooks({})
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [groupPath]: GroupService
  }
}
