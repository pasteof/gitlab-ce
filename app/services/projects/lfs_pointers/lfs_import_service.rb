# This service manages the whole worflow of discovering the Lfs files in a
# repository, linking them to the project and downloading (and linking) the non
# existent ones.
module Projects
  module LfsPointers
    class LfsImportService < BaseService
      HEAD_REV = 'head'.freeze
      LFS_ENDPOINT_PATTERN = /^\t?url\s=\s(.+)$/.freeze

      LfsImportError = Class.new(StandardError)

      def execute
        return {} unless check_lfs_enabled

        existent_lfs = LfsListService.new(project).execute

        download_links = LfsDownloadLinkListService.new(project,
                                                        import_url: @lfs_endpoint || project.import_url)
                                                   .execute(not_linked_lfs(existent_lfs))

        download_links
      rescue LfsDownloadLinkListService::DownloadLinksError => e
        raise LfsImportError, "The LFS objects download list couldn't be imported. Error: #{e.message}"
      end

      private

      def check_lfs_enabled
        return false unless project&.lfs_enabled?

        data = project.repository.lfsconfig_for(HEAD_REV)

        if result = data&.match(LFS_ENDPOINT_PATTERN)
          endpoint = URI.parse(result[1])
          import_uri = URI.parse(project.import_url)

          # If the endpoint host is different from the import_url it means
          # that the repo is using a third party service for storing the LFS files.
          # In this case, we have to disable lfs in the project
          if endpoint.host != import_uri.host
            disable_lfs!

            return false
          else
            set_lfs_endpoint(endpoint, import_uri.user, import_uri.password)
          end
        end

        true
      rescue URI::InvalidURIError
        raise LfsImportError, 'Invalid url in .lfsconfig file'
      end

      def not_linked_lfs(oids)
        linked_oids = LfsLinkService.new(project).execute(oids.keys)

        oids.except(*linked_oids)
      end

      def disable_lfs!
        project.update(lfs_enabled: false)
      end

      def set_lfs_endpoint(uri, user, password)
        uri.user = user
        uri.password = password
        @lfs_endpoint = uri.to_s
      end
    end
  end
end
