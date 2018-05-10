require "spec_helper"

describe "User adds a comment on a commit", :js do
  include Spec::Support::Helpers::Features::NotesHelpers
  include RepoHelpers

  let(:comment_text) { "XML attached" }
  let(:project) { create(:project, :repository) }
  let(:user) { create(:user) }

  before do
    sign_in(user)
    project.add_developer(user)

    visit(project_commit_path(project, sample_commit.id))
  end

  it "adds a comment" do
    EMOJI = ":+1:".freeze

    page.within(".js-main-target-form") do
      expect(page).not_to have_link("Cancel")

      fill_in("note[note]", with: "#{comment_text} #{EMOJI}")

      # Check on `Preview` tab
      click_link("Preview")

      expect(find(".js-md-preview")).to have_content(comment_text).and have_css("gl-emoji")
      expect(page).not_to have_css(".js-note-text")

      # Check on the `Write` tab
      click_link("Write")

      expect(page).to have_field("note[note]", with: "#{comment_text} #{EMOJI}")

      # Submit comment from the `Preview` tab to get rid of a separate `it` block
      # which would specially tests if everything gets cleared from the note form.
      click_link("Preview")
      click_button("Comment")
    end

    wait_for_requests

    page.within(".note") do
      expect(page).to have_content(comment_text).and have_css("gl-emoji")
    end

    page.within(".js-main-target-form") do
      expect(page).to have_field("note[note]", with: "").and have_no_css(".js-md-preview")
    end
  end

  context "when commenting on diff" do
    it "adds a comment" do
      page.within(".diff-file:nth-of-type(1)") do
        click_diff_line(sample_commit.line_code)

        expect(page).to have_css(".js-temp-notes-holder form.new-note")
                   .and have_css(".js-close-discussion-note-form", text: "Cancel")

        find(".js-close-discussion-note-form").click

        expect(page).not_to have_css("form.new_note")

        click_diff_line(sample_commit.line_code)
        click_diff_line(sample_commit.line_code) # Try to open the same form twice.

        expect(page).to have_css("form.new-note", count: 1)

        page.within("form[data-line-code='#{sample_commit.line_code}']") do
          fill_in("note[note]", with: "#{comment_text} :smile:")
          click_button("Comment")
        end
      end

      page.within(".diff-file:nth-of-type(1) .note") do
        expect(page).to have_content(comment_text).and have_xpath("//gl-emoji[@data-name='smile']")
      end
    end
  end

  private

  def click_diff_line(line)
    find(".line_holder[id='#{line}'] td:nth-of-type(1)").hover
    find(".line_holder[id='#{line}'] button").click
  end
end
