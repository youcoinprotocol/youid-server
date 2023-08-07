import type { HookContext, NextFunction } from '../declarations'

export const selfQuery =
  (field: string): ((context: HookContext) => Promise<any>) =>
  async (context: HookContext) => {
    if (context.params.user) {
      context.params.query[field] = context.params.user.id
    }
  }
