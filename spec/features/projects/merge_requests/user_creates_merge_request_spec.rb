require "spec_helper"

describe "User creates a merge request", :js do
  include ProjectForksHelper

  let(:project) { create(:project, :repository) }
  let(:user) { create(:user) }

  before do
    project.add_master(user)
    sign_in(user)
  end

  it "creates a merge request" do
    visit(project_new_merge_request_path(project))

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

  context "to a forked project" do
    let(:forked_project) { fork_project(project, user, namespace: user.namespace, repository: true) }

    it "creates a merge request" do
      visit(project_new_merge_request_path(forked_project))

      expect(page).to have_content("Source branch").and have_content("Target branch")
      expect(find("#merge_request_target_project_id", visible: false).value).to eq(project.id.to_s) # project id is string in an HTML input field

      first(".js-source-project").click
      first(".dropdown-source-project a", text: forked_project.full_path)

      first(".js-target-project").click
      first(".dropdown-target-project a", text: project.full_path)

      first(".js-source-branch").click

      wait_for_requests

      SOURCE_BRANCH = "fix".freeze

      first(".js-source-branch-dropdown .dropdown-content a", text: SOURCE_BRANCH).click

      click_button("Compare branches and continue")

      expect(page).to have_css("h3.page-title", text: "New Merge Request")

      page.within("form#new_merge_request") do
        TITLE = "Merge Request On Forked Project".freeze

        fill_in("Title", with: TITLE)
      end

      click_button("Submit merge request")

      expect(page).to have_content(TITLE).and have_content("Request to merge #{user.namespace.name}:#{SOURCE_BRANCH} into master")
    end
  end
end


