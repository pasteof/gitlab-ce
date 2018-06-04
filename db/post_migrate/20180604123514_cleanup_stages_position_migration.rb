class CleanupStagesPositionMigration < ActiveRecord::Migration
  include Gitlab::Database::MigrationHelpers

  DOWNTIME = false

  disable_ddl_transaction!

  class Stages < ActiveRecord::Base
    include EachBatch
    self.table_name = 'ci_stages'
  end

  def up
    disable_statement_timeout

    Gitlab::BackgroundMigration.steal('MigrateStageIndex')

    Stages.where('position is NULL').each_batch(of: 1000) do |batch|
      range = batch.pluck('MIN(id)', 'MAX(id)').first

      Gitlab::BackgroundMigration::MigrateStageIndex.new.perform(*range)
    end
  end

  def down
    # noop
  end
end
