require 'spec_helper'
require Rails.root.join('db', 'post_migrate', '20180604123514_cleanup_stages_position_migration.rb')

describe CleanupStagesPositionMigration, :migration, :sidekiq, :redis do
  let(:migration) { spy('migration') }

  before do
    allow(Gitlab::BackgroundMigration::MigrateStageIndex)
      .to receive(:new).and_return(migration)
  end

  context 'when there are pending background migrations' do
    it 'processes pending jobs synchronously' do
      Sidekiq::Testing.disable! do
        BackgroundMigrationWorker
          .perform_in(2.minutes, 'MigrateStageIndex', [1, 1])
        BackgroundMigrationWorker
          .perform_async('MigrateStageIndex', [1, 1])

        migrate!

        expect(migration).to have_received(:perform).with(1, 1).twice
      end
    end
  end

  context 'when there are no background migrations pending' do
    it 'does nothing' do
      Sidekiq::Testing.disable! do
        migrate!

        expect(migration).not_to have_received(:perform)
      end
    end
  end

  context 'when there are still unmigrated stages present' do
    let(:stages) { table('ci_stages') }

    before do
      stages.create!(name: 'build')
      stages.create!(name: 'test')
      stages.update_all(position: nil)
    end

    it 'migrates stages sequentially in batches' do
      expect(stages.all).to all(have_attributes(position: nil))

      migrate!

      expect(migration).to have_received(:perform).once
    end
  end
end
