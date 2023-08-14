import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex'

import type { Application } from '../../declarations'
import { randomUUID } from 'crypto'

type User = {
  id: string
  username: string
  walletId?: string
  createdAt: string
  updatedAt: string
}
type UserData = Partial<User>
type UserPatch = Omit<UserData, 'id' | 'createdAt'>
type UserQuery = any

export type { User, UserData, UserPatch, UserQuery }

export interface UserParams extends KnexAdapterParams<UserQuery> {}

export class UserService<ServiceParams extends Params = UserParams> extends KnexService<
  User,
  UserData,
  UserParams,
  UserPatch
> {
  async findOrCreate(username: string) {
    let user: User | null
    const users = await this.find({
      query: {
        $limit: 1,
        username
      },
      paginate: false
    })
    if (users.length) {
      user = users[0]
    } else {
      user = await this.create({
        id: randomUUID(),
        username
      })
    }

    return user
  }
}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mysqlClient'),
    name: 'users'
  }
}
