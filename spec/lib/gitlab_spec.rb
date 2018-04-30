require 'fast_spec_helper'

require_dependency 'gitlab'

describe Gitlab do
  describe '.root' do
    it 'returns the root path of the app' do
      expect(described_class.root).to eq(Pathname.new(File.expand_path('../..', __dir__)))
    end
  end

  describe '.com?' do
    it 'is true when on GitLab.com' do
      stub_config_setting(url: 'https://gitlab.com')

      expect(described_class.com?).to eq true
    end

    it 'is true when on staging' do
      stub_config_setting(url: 'https://staging.gitlab.com')

      expect(described_class.com?).to eq true
    end

    it 'is true when on other gitlab subdomain' do
      stub_config_setting(url: 'https://example.gitlab.com')

      expect(described_class.com?).to eq true
    end

    it 'is false when not on GitLab.com' do
      stub_config_setting(url: 'http://example.com')

      expect(described_class.com?).to eq false
    end
  end
end
