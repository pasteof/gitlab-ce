# This service manages the whole worflow of discovering the Lfs files in a
# repository, linking them to the project and downloading (and linking) the non
# existent ones.
module Projects
  module LfsPointers
    class LfsImportService < BaseService
      include Gitlab::Utils::StrongMemoize

      HEAD_REV = 'head'.freeze
      LFS_ENDPOINT_PATTERN = /^\t?url\s=\s(.+)$/.freeze

      LfsImportError = Class.new(StandardError)

      def execute
        return {} unless project&.lfs_enabled?

        if external_lfs_endpoint?
          # If the endpoint host is different from the import_url it means
          # that the repo is using a third party service for storing the LFS files.
          # In this case, we have to disable lfs in the project
          disable_lfs!

          return {}
        end

        get_download_links(lfsconfig_endpoint_uri&.to_s || project.import_url)
      rescue LfsDownloadLinkListService::DownloadLinksError => e
        raise LfsImportError, "The LFS objects download list couldn't be imported. Error: #{e.message}"
      end

      private

      def external_lfs_endpoint?
        lfsconfig_endpoint_uri && lfsconfig_endpoint_uri.host != import_uri.host
      end

      def lfsconfig_endpoint_uri
        strong_memoize(:lfsconfig_endpoint_uri) do
          # Retrieveing the blob data from the .lfsconfig file
          data = project.repository.lfsconfig_for(HEAD_REV)
          # Parsing the data to retrieve the url
          parsed_data = data&.match(LFS_ENDPOINT_PATTERN)

          if parsed_data
            URI.parse(parsed_data[1]).tap do |endpoint|
              endpoint.user ||= import_uri.user
              endpoint.password ||= import_uri.password
            end
          end
        end
      rescue URI::InvalidURIError
        raise LfsImportError, 'Invalid URL in .lfsconfig file'
      end

      def import_uri
        @import_uri ||= URI.parse(project.import_url)
      rescue URI::InvalidURIError
        raise LfsImportError, 'Invalid project import URL'
      end

      def disable_lfs!
        project.update(lfs_enabled: false)
      end

      def get_download_links(url)
        existent_lfs = LfsListService.new(project).execute
        linked_oids = LfsLinkService.new(project).execute(existent_lfs.keys)

        # Retrieving those oids not linked and which we need to download
        not_linked_lfs = existent_lfs.except(*linked_oids)

        LfsDownloadLinkListService.new(project, import_url: url).execute(not_linked_lfs)
      end
    end
  end
end
