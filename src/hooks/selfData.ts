import type { HookContext, NextFunction } from '../declarations'

export const selfData = (field: string):(context: HookContext) => Promise<any> => async (context: HookContext) => {
  context.data[field] = context.params.user.id;
}
