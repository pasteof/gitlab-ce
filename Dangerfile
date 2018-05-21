# rubocop:disable Style/SignalException

require 'yaml'

## Metadata checks
if gitlab.mr_body.size < 5
  fail "Please provide a merge request description."
end

if gitlab.mr_labels.empty?
  fail "Please add labels to this merge request."
end

unless gitlab.mr_json["assignee"]
  warn "This merge request does not have any assignee yet. Setting an assignee clarifies who needs to take action on the merge request at any given time."
end

has_milestone = !gitlab.mr_json["milestone"].nil?

unless has_milestone
  warn "This merge request does not refer to an existing milestone.", sticky: false
end

has_pick_into_stable_label = gitlab.mr_labels.find { |label| label.start_with?('Pick into') }

if gitlab.branch_for_base != "master" && !has_pick_into_stable_label
  fail "All merge requests should target `master`. Otherwise, please set the relevant `Pick into X.Y` label."
end

## Changes size checks
if git.lines_of_code > 500
  warn "This merge request is quite big, please consider splitting it into multiple merge requests."
end

if git.lines_of_code > 5_000
  fail "This merge request is definitely too big, please split it into multiple merge requests."
end

## Changelog checks
def check_changelog(path)
  yaml = YAML.safe_load(File.read(path))

  fail "`title` should be set, in #{gitlab.html_link(path)}." if yaml["title"].nil?
  fail "`type` should be set, in #{gitlab.html_link(path)}." if yaml["type"].nil?

  if yaml["merge_request"].nil?
    message "Consider setting `merge_request` to #{gitlab.mr_json["iid"]} in #{gitlab.html_link(path)}."
  elsif yaml["merge_request"] != gitlab.mr_json["iid"]
    fail "Merge request IID was not set to #{gitlab.mr_json["iid"]}!"
  end
rescue StandardError
  # YAML could not be parsed, fail the build.
  fail "#{gitlab.html_link(path)} isn't valid YAML!"
end

changelog_needed = !gitlab.mr_labels.include?("backstage")
changelog_found = git.added_files.find { |path| path =~ %r{\A(ee/)?(changelogs/unreleased)(-ee)?/} }

if git.modified_files.include?("CHANGELOG.md")
  fail "CHANGELOG.md was edited. Please remove the additions and create an entry with `bin/changelog -m #{gitlab.mr_json["iid"]}` instead."
end

if changelog_needed
  if changelog_found
    check_changelog(path)
  else
    warn "This merge request is missing a CHANGELOG entry, you can create one with `bin/changelog -m #{gitlab.mr_json["iid"]}`. " \
      "If your merge request doesn't warrant a CHANGELOG entry, consider adding the ~backstage label."
  end
end

## App / Specs checks
has_app_changes = !git.modified_files.grep(%r{\A(ee/)?(app|lib|db/(geo/)?(post_)?migrate)/}).empty?
has_spec_changes = !git.modified_files.grep(/spec/).empty?

if has_app_changes && !has_spec_changes
  warn "You've made some app changes, but didn't add any tests. " \
    "That's OK as long as you're refactoring existing code (please consider adding the ~backstage label in that case).", sticky: false
end

## Gemfile / Gemfile.lock checks
gemfile_modified = git.modified_files.include?("Gemfile")
gemfile_lock_modified = git.modified_files.include?("Gemfile.lock")

if gemfile_modified && !gemfile_lock_modified
  warn "#{gitlab.html_link("Gemfile")} was edited but #{gitlab.html_link("Gemfile.lock")} wasn't. " \
    "Usually, when #{gitlab.html_link("Gemfile")} is updated, you should run `bundle install` or " \
    "`bundle update <the-added-or-updated-gem>` and commit the #{gitlab.html_link("Gemfile.lock")} changes."
end

## Migration / database checks
db_schema_updated = !git.modified_files.grep(%r{\A(ee/)?(db/(geo/)?(post_)?migrate)/}).empty?
migration_created = !git.added_files.grep(%r{\A(db/(post_)?migrate)/}).empty?
geo_migration_created = !git.added_files.grep(%r{\Aee/(db/geo/(post_)?migrate)/}).empty?

if (migration_created || geo_migration_created) && !db_schema_updated
  msg = ["New migrations were added but #{gitlab.html_link("db/schema.rb")}"]
  msg << "(nor #{gitlab.html_link("ee/db/geo/schema.rb")})" if geo_migration_created
  msg << "wasn't. Usually, when adding new migrations, #{gitlab.html_link("db/schema.rb")}"
  msg << "(and #{gitlab.html_link("ee/db/geo/schema.rb")})" if geo_migration_created
  msg << "should be updated too (unless your migrations are data migrations)."

  warn msg.join(" ")
end
