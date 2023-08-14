// For more information about this file see https://dove.feathersjs.com/guides/cli/knexfile.html
import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.table('identities', (table) => {
    table.string('commitment').index().alter()
  })
}

export async function down(knex: Knex): Promise<void> {}