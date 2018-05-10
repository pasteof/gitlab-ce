module SharedDiffNote
  include Spinach::DSL
  include RepoHelpers
  include WaitForRequests

  after do
    wait_for_requests if javascript_test?
  end

  step 'I delete a diff comment' do
    find('.note').hover
    find(".js-note-delete").click
  end

  step 'I haven\'t written any diff comment text' do
    page.within(diff_file_selector) do
      fill_in "note[note]", with: ""
    end
  end

  step 'I leave a diff comment in a parallel view on the right side like "New comment"' do
    click_parallel_diff_line(sample_commit.line_code, 'new')
    page.within("#{diff_file_selector} form[data-line-code='#{sample_commit.line_code}']") do
      fill_in "note[note]", with: "New comment"
      find(".js-comment-button").click
    end
  end

  step 'I open a diff comment form' do
    page.within(diff_file_selector) do
      click_diff_line(sample_commit.line_code)
    end
  end

  step 'The diff comment preview tab should say there is nothing to do' do
    page.within(diff_file_selector) do
      find('.js-md-preview-button').click
      expect(find('.js-md-preview')).to have_content('Nothing to preview.')
    end
  end

  step 'I should see a diff comment on the right side saying "New comment"' do
    page.within("#{diff_file_selector} .notes_content.parallel.new") do
      expect(page).to have_content("New comment")
    end
  end

  step 'I click side-by-side diff button' do
    find('#parallel-diff-btn').click
  end

  step 'I see side-by-side diff button' do
    expect(page).to have_content "Side-by-side"
  end

  def diff_file_selector
    '.diff-file:nth-of-type(1)'
  end

  def click_diff_line(code)
    find(".line_holder[id='#{code}'] button").click
  end

  def click_parallel_diff_line(code, line_type)
    find(".line_holder.parallel td[id='#{code}']").find(:xpath, 'preceding-sibling::*[1][self::td]').hover
    find(".line_holder.parallel button[data-line-code='#{code}']").click
  end
end
