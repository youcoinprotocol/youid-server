import type { Id, NullableId, Params, ServiceInterface } from '@feathersjs/feathers'

import type { Application } from '../../declarations'

type Group = {
  id: number
  members: string[]
}
type GroupData = any
type GroupPatch = any
type GroupQuery = any

export type { Group, GroupData, GroupPatch, GroupQuery }

export interface GroupServiceOptions {
  app: Application
}

export interface GroupParams extends Params<GroupQuery> {}

// This is a skeleton for a custom service class. Remove or add the methods you need here
export class GroupService<ServiceParams extends GroupParams = GroupParams>
  implements ServiceInterface<Group, GroupData, ServiceParams, GroupPatch>
{
  app: Application
  constructor(public options: GroupServiceOptions) {
    this.app = options.app
  }

  async get(id: Id, _params?: ServiceParams): Promise<Group> {
    const res = new Array<string>()
    const traits = await this.app.service('traits').find({
      query: {
        groupId: id,
        $sort: {
          idx: 1
        }
      },
      paginate: false
    })

    return {
      id: parseInt(`${id}`),
      members: traits.map((o) => o.commitment)
    }
  }
}

export const getOptions = (app: Application) => {
  return { app }
}
