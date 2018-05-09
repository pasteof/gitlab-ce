class Spinach::Features::ProjectForkedMergeRequests < Spinach::FeatureSteps
  include SharedAuthentication
  include SharedProject
  include SharedNote
  include SharedPaths
  include Select2Helper
  include WaitForRequests
  include ProjectForksHelper

  step 'I am a member of project "Shop"' do
    @project = ::Project.find_by(name: "Shop")
    @project ||= create(:project, :repository, name: "Shop")
    @project.add_reporter(@user)
  end

  step 'I have a project forked off of "Shop" called "Forked Shop"' do
    @forked_project = fork_project(@project, @user,
                                   namespace: @user.namespace,
                                   repository: true)
  end

  step 'I should see last push widget' do
    expect(page).to have_content "You pushed to new_design"
    expect(page).to have_link "Create Merge Request"
  end
end
