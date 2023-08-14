// For more information about this file see https://dove.feathersjs.com/guides/cli/typescript.html
import { HookContext as FeathersHookContext, NextFunction } from '@feathersjs/feathers'
import { Application as FeathersApplication } from '@feathersjs/koa'
import { DefaultAppConfiguration } from '@feathersjs/schema'

type ApplicationConfiguration = DefaultAppConfiguration & {
  authentication: DefaultAppConfiguration['authentication'] & {
    otp: {
      expriesIn: number
    }
  }
  host: string
  port: number
  public: string
  resources: string
  sendgrid: {
    apiKey: string
    sender: string
  }
  appSecret: string
  contracts: {
    semaphore: string
    rpc: string
    startBlock: number
  }
}

import { User } from './services/users/users'

export { NextFunction }

// The types for app.get(name) and app.set(name)
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Configuration extends ApplicationConfiguration {}

// A mapping of service names to types. Will be extended in service files.
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ServiceTypes {
  mailer: any
}

// The application instance type that will be used everywhere else
export type Application = FeathersApplication<ServiceTypes, Configuration>

// The context for hook functions - can be typed with a service class
export type HookContext<S = any> = FeathersHookContext<Application, S>

// Add the user as an optional property to all params
declare module '@feathersjs/feathers' {
  interface Params {
    user?: User
  }
}
