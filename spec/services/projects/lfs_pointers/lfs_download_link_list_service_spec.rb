require 'spec_helper'

describe Projects::LfsPointers::LfsDownloadLinkListService do
  let(:import_url) { 'http://www.gitlab.com/demo/repo.git' }
  let!(:project) { create(:project, import_url: import_url) }
  let(:new_oids) { { 'oid1' => 123, 'oid2' => 125 } }

  let(:objects_response) do
    body = new_oids.map do |oid, size|
      {
        'oid' => oid,
        'size' => size,
        'actions' => {
          'download' => { 'href' => "#{import_url}/gitlab-lfs/objects/#{oid}" }
        }
      }
    end

    Struct.new(:success?, :objects).new(true, body)
  end

  let(:invalid_object_response) do
    [
      'oid' => 'whatever',
      'size' => 123
    ]
  end

  subject { described_class.new(project, import_url: import_url) }

  before do
    allow(project).to receive(:lfs_enabled?).and_return(true)
    allow(Gitlab::HTTP).to receive(:post).and_return(objects_response)
  end

  describe '#execute' do
    it 'retrieves each download link of every non existent lfs object' do
      subject.execute(new_oids).each do |oid, link|
        expect(link).to eq "#{import_url}/gitlab-lfs/objects/#{oid}"
      end
    end

    context 'credentials' do
      context 'when the download link and the import_url have the same host' do
        let(:import_url_with_credentials) { 'http://user:password@www.gitlab.com/demo/repo.git' }

        context 'when import_url has credentials' do
          it 'adds credentials to the download_link' do
            result = described_class.new(project, import_url: import_url_with_credentials).execute(new_oids)

            result.each do |oid, link|
              expect(link.starts_with?('http://user:password@')).to be_truthy
            end
          end
        end

        context 'when import_url does not have any credentials' do
          it 'does not add any credentials' do
            result = subject.execute(new_oids)

            result.each do |oid, link|
              expect(link.starts_with?('http://user:password@')).to be_falsey
            end
          end
        end
      end

      context 'when the download link and the import_url have different hosts' do
        let(:import_url_with_credentials) { 'http://user:password@www.otherdomain.com/demo/repo.git' }

        it 'downloads without any credentials' do
          result = described_class.new(project, import_url: import_url_with_credentials).execute(new_oids)

          result.each do |oid, link|
            expect(link.starts_with?('http://user:password@')).to be_falsey
          end
        end
      end
    end
  end

  describe '#get_download_links' do
    it 'raise errorif request fails' do
      allow(Gitlab::HTTP).to receive(:post).and_return(Struct.new(:success?, :message).new(false, 'Failed request'))

      expect { subject.send(:get_download_links, new_oids) }.to raise_error(described_class::DownloadLinksError)
    end
  end

  describe '#parse_response_links' do
    it 'does not add oid entry if href not found' do
      expect(Rails.logger).to receive(:error).with("Link for Lfs Object with oid whatever not found or invalid.")

      result = subject.send(:parse_response_links, invalid_object_response)

      expect(result).to be_empty
    end
  end

  describe '#uri_with_git_suffix' do
    it 'adds suffix .git if the url does not have it' do
      url = 'http://www.gitlab.com/namespace/repo'

      expect(subject.send(:uri_with_git_suffix, url).to_s).to eq url + '.git'
    end
  end
end
