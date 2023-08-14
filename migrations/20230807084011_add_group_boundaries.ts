// For more information about this file see https://dove.feathersjs.com/guides/cli/knexfile.html
import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.table('reputations', (table) => {
    table.bigInteger('lowerGroupId').defaultTo(0)
    table.bigInteger('upperGroupId').defaultTo(0)
  })
}

export async function down(knex: Knex): Promise<void> {}
