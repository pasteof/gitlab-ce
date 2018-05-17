<script>
import { mapState, mapActions } from 'vuex';
import bp from '~/breakpoints';
import LoadingIcon from '~/vue_shared/components/loading_icon.vue';
import eventHub from '../event_hub';
import store from '../store/';
import { VIEW_STATES, STORAGE_KEY } from '../constants';
import FrequentProjectsSearchInput from './frequent_projects_search_input.vue';
import FrequentItemsList from './frequent_items_list.vue';
import FrequentItemsSearchList from './frequent_items_search_list.vue';

export default {
  store,
  components: {
    LoadingIcon,
    FrequentProjectsSearchInput,
    FrequentItemsList,
    FrequentItemsSearchList,
  },
  props: {
    currentUserName: {
      type: String,
      required: true,
    },
    currentItem: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapState([
      'searchQuery',
      'isLoadingItems',
      'isItemsListVisible',
      'isSearchListVisible',
      'isLocalStorageFailed',
      'isSearchFailed',
      'frequentItems',
      'searchedItems',
    ]),
  },
  created() {
    const { currentUserName, currentItem } = this;

    if (currentItem.id) {
      this.logItemAccess(currentItem);
    }

    this.setNamespace('projects');
    this.setStorageKey(`${currentUserName}/${STORAGE_KEY.groups}`);

    eventHub.$on('projects-dropdownOpen', this.dropdownOpenHandler);
  },
  beforeDestroy() {
    eventHub.$off('projects-dropdownOpen', this.dropdownOpenHandler);
  },
  methods: {
    ...mapActions([
      'logItemAccess',
      'setNamespace',
      'setStorageKey',
      'fetchFrequentItems',
      'toggleVisibility',
    ]),
    dropdownOpenHandler() {
      const screenSize = bp.getBreakpointSize();
      if (this.searchQuery && (screenSize !== 'sm' && screenSize !== 'xs')) {
        this.toggleVisibility(VIEW_STATES.IS_SEARCH_LIST_VISIBLE);
      } else {
        this.fetchFrequentItems();
      }
    },
  },
};
</script>

<template>
  <div>
    <frequent-projects-search-input />
    <loading-icon
      class="loading-animation prepend-top-20"
      size="2"
      v-if="isLoadingItems"
      :label="s__('ProjectsDropdown|Loading projects')"
    />
    <div
      class="section-header"
      v-if="isItemsListVisible"
    >
      {{ s__('ProjectsDropdown|Frequently visited') }}
    </div>
    <frequent-items-list
      v-if="isItemsListVisible"
      :items="frequentItems"
      :local-storage-failed="isLocalStorageFailed"
      :error-message="s__('ProjectsDropdown|This feature requires browser localStorage support')"
      :empty-message="s__('ProjectsDropdown|Projects you visit often will appear here')"
    />
    <frequent-items-search-list
      v-if="isSearchListVisible"
      :search-failed="isSearchFailed"
      :matcher="searchQuery"
      :items="searchedItems"
      :error-message="s__('ProjectsDropdown|Something went wrong on our end.')"
      :empty-message="s__('ProjectsDropdown|Sorry, no projects matched your search')"
    />
  </div>
</template>
