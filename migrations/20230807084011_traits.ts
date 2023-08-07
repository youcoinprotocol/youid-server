// For more information about this file see https://dove.feathersjs.com/guides/cli/knexfile.html
import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('traits', (table) => {
    table.string('id').primary()
    table.uuid('userId').references('id').inTable('users').notNullable()
    table.bigInteger('groupId')
    table.bigInteger('blockNumber')
    table.timestamps(false, true, true)
    table.index(['userId', 'groupId'])
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('traits')
}
