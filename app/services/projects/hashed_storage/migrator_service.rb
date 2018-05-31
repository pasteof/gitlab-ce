module Projects
  module HashedStorage
    class MigratorService < BaseService
      BATCH_SIZE = 100

      def initialize
        # overriding initializer from BaseService
      end

      def bulk_schedule(start, finish)
        StorageMigratorWorker.perform_async(start, finish)
      end

      def bulk_migrate(start, finish)
        projects = build_relation(start, finish)

        projects.with_route.find_each(batch_size: BATCH_SIZE) do |project|
          migrate(project)
        end
      end

      def migrate(project)
        Rails.logger.info "Starting storage migration of #{project.full_path} (ID=#{project.id})..."

        project.migrate_to_hashed_storage!
      rescue => err
        Rails.logger.error("#{err.message} migrating storage of #{project.full_path} (ID=#{project.id}), trace - #{err.backtrace}")
      end

      private

      def build_relation(start, finish)
        relation = Project
        table = Project.arel_table

        relation = relation.where(table[:id].gteq(start)) if start
        relation = relation.where(table[:id].lteq(finish)) if finish

        relation
      end
    end
  end
end
