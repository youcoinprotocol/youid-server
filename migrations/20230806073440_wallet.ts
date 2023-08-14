// For more information about this file see https://dove.feathersjs.com/guides/cli/knexfile.html
import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('wallets', (table) => {
    table.uuid('id').primary()
    table.string('address')
    table.string('privateKey')
    table.timestamps(false,true,true)
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('wallets')
}
