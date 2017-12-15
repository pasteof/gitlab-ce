module EE
  module ServicesHelper
    def add_to_slack_link(project, slack_app_id)
      "https://slack.com/oauth/authorize?scope=commands&client_id=#{slack_app_id}&redirect_uri=#{slack_auth_project_settings_slack_url(project)}"
    end

    def add_to_slack_data(projects)
      {
        projects: projects,
        sign_in_path: new_session_path(:user, redirect_to_referer: 'yes'),
        is_signed_in: current_user.present?,
        slack_link_profile_slack_path: slack_link_profile_slack_path,
        gitlab_for_slack_gif_path: image_path('gitlab_for_slack.gif'),
        gitlab_logo_path: image_path('illustrations/gitlab_logo.svg'),
        slack_logo_path: image_path('illustrations/slack_logo.svg'),
        docs_path: help_page_path('integration/slash_commands.md')
      }.to_json.html_safe
    end
  end
end