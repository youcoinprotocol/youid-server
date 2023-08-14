// For more information about this file see https://dove.feathersjs.com/guides/cli/knexfile.html
import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('identities', (table) => {
    table.uuid('id').primary()
    table.uuid('userId').references('id').inTable('users').notNullable()
    table.bigInteger('reputationId').references('id').inTable('reputations').notNullable()
    table.string('commitment')
    table.text('keys')
    table.timestamps(false, true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('identities')
}
