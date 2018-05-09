require "spec_helper"

describe "User creates a merge request", :js do
  let(:project) { create(:project, :repository) }
  let(:user) { create(:user) }

  before do
    project.add_master(user)
    sign_in(user)

    visit(project_new_merge_request_path(project))
  end

  it "creates a merge request" do
    find(".js-source-branch").click
    click_link("fix")

    find(".js-target-branch").click
    click_link("feature")

    click_button("Compare branches")

    TITLE = "Wiki Feature".freeze

    fill_in("Title", with: TITLE)
    click_button("Submit merge request")

    page.within(".merge-request") do
      expect(page).to have_content(TITLE)
    end
  end
end
