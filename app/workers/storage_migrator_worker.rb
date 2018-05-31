class StorageMigratorWorker
  include ApplicationWorker

  def perform(start, finish)
    migrator = Projects::HashedStorage::MigratorService.new
    migrator.bulk_migrate(start, finish)
  end
end
