module EE
  module Note
    extend ActiveSupport::Concern

    def for_epic?
      noteable.is_a?(Epic)
    end

    def for_project_noteable?
      !for_epic? && super
    end
  end
end