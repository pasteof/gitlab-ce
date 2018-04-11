export const FREQUENT_ITEMS = {
  MAX_COUNT: 20,
  LIST_COUNT_DESKTOP: 5,
  LIST_COUNT_MOBILE: 3,
  ELIGIBLE_FREQUENCY: 3,
};

export const HOUR_IN_MS = 3600000;

export const STORAGE_KEY = {
  projects: 'frequent-projects',
};

export const TRANSLATION_KEYS = {
  projects: {
    loadingMessage: 'ProjectsDropdown|Loading projects',
    header: 'ProjectsDropdown|Frequently visited',
    itemListErrorMessage: 'ProjectsDropdown|This feature requires browser localStorage support',
    itemListEmptyMessage: 'ProjectsDropdown|Projects you visit often will appear here',
    searchListErrorMessage: 'ProjectsDropdown|Something went wrong on our end.',
    searchListEmptyMessage: 'ProjectsDropdown|Sorry, no projects matched your search',
    searchInputPlaceholder: 'ProjectsDropdown|Search your projects',
  },
};
