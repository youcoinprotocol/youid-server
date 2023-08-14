// For more information about this file see https://dove.feathersjs.com/guides/cli/knexfile.html
import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('proofs', (table) => {
    table.string('id').primary()
    table.string('code')
    table.text('bundle')
    table.uuid('userId').references('id').inTable('users').notNullable()
    table.timestamps(false, true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('proofs')
}
