<script>
import { mapState, mapActions } from 'vuex';
import bp from '~/breakpoints';
import LoadingIcon from '~/vue_shared/components/loading_icon.vue';
import eventHub from '../event_hub';
import store from '../store/';
import { VIEW_STATES, STORAGE_KEY } from '../constants';
import FrequentGroupsSearchInput from './frequent_groups_search_input.vue';
import FrequentItemsList from './frequent_items_list.vue';
import FrequentItemsSearchList from './frequent_items_search_list.vue';

export default {
  store,
  components: {
    LoadingIcon,
    FrequentGroupsSearchInput,
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

    this.setNamespace('groups');
    this.setStorageKey(`${currentUserName}/${STORAGE_KEY.groups}`);

    eventHub.$on('groups-dropdownOpen', this.dropdownOpenHandler);
  },
  beforeDestroy() {
    eventHub.$off('groups-dropdownOpen', this.dropdownOpenHandler);
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
    <frequent-groups-search-input />
    <loading-icon
      class="loading-animation prepend-top-20"
      size="2"
      v-if="isLoadingItems"
      :label="s__('GroupsDropdown|Loading groups')"
    />
    <div
      class="section-header"
      v-if="isItemsListVisible"
    >
      {{ s__('GroupsDropdown|Frequently visited') }}
    </div>
    <frequent-items-list
      v-if="isItemsListVisible"
      :items="frequentItems"
      :local-storage-failed="isLocalStorageFailed"
      :error-message="s__('GroupsDropdown|This feature requires browser localStorage support')"
      :empty-message="s__('GroupsDropdown|Groups you visit often will appear here')"
    />
    <frequent-items-search-list
      v-if="isSearchListVisible"
      :search-failed="isSearchFailed"
      :matcher="searchQuery"
      :items="searchedItems"
      :error-message="s__('GroupsDropdown|Something went wrong on our end.')"
      :empty-message="s__('GroupsDropdown|Sorry, no groups matched your search')"
    />
  </div>
</template>
