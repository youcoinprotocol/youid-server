// For more information about this file see https://dove.feathersjs.com/guides/cli/knexfile.html
import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('reputations', (table) => {
    table.bigInteger('id').primary()
    table.string('name')
    table.string('contentURI')
    table.text('content').nullable()
    table.timestamps(false,true,true)
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('reputations')
}
