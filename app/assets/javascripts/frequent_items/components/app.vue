<script>
import bs from '~/breakpoints';
import loadingIcon from '~/vue_shared/components/loading_icon.vue';

import eventHub from '../event_hub';
import frequentItemsSearchInput from './frequent_items_search_input.vue';
import frequentItemsList from './frequent_items_list.vue';
import frequentItemsSearchList from './frequent_items_search_list.vue';

export default {
  components: {
    frequentItemsSearchInput,
    loadingIcon,
    frequentItemsList,
    frequentItemsSearchList,
  },
  props: {
    namespace: {
      type: String,
      required: true,
    },
    currentItem: {
      type: Object,
      required: true,
    },
    store: {
      type: Object,
      required: true,
    },
    service: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      isLoadingItems: false,
      isItemsListVisible: false,
      isSearchListVisible: false,
      isLocalStorageFailed: false,
      isSearchFailed: false,
      searchQuery: '',
    };
  },
  computed: {
    translations() {
      return this.service.getTranslations(['loadingMessage', 'header']);
    },
    frequentItems() {
      return this.store.getFrequentItems();
    },
    searchItems() {
      return this.store.getSearchedItems();
    },
  },
  created() {
    if (this.currentItem.id) {
      this.logCurrentItemAccess();
    }

    eventHub.$on('dropdownOpen', this.fetchFrequentItems);
    eventHub.$on('searchItems', this.fetchSearchedItems);
    eventHub.$on('searchCleared', this.handleSearchClear);
    eventHub.$on('searchFailed', this.handleSearchFailure);
  },
  beforeDestroy() {
    eventHub.$off('dropdownOpen', this.fetchFrequentItems);
    eventHub.$off('searchItems', this.fetchSearchedItems);
    eventHub.$off('searchCleared', this.handleSearchClear);
    eventHub.$off('searchFailed', this.handleSearchFailure);
  },
  methods: {
    toggleFrequentItemsList(state) {
      this.isLoadingItems = !state;
      this.isSearchListVisible = !state;
      this.isItemsListVisible = state;
    },
    toggleSearchItemsList(state) {
      this.isLoadingItems = !state;
      this.isItemsListVisible = !state;
      this.isSearchListVisible = state;
    },
    toggleLoader(state) {
      this.isItemsListVisible = !state;
      this.isSearchListVisible = !state;
      this.isLoadingItems = state;
    },
    fetchFrequentItems() {
      const screenSize = bs.getBreakpointSize();
      if (this.searchQuery && (screenSize !== 'sm' && screenSize !== 'xs')) {
        this.toggleSearchItemsList(true);
      } else {
        this.toggleLoader(true);
        this.isLocalStorageFailed = false;
        const items = this.service.getFrequentItems();
        if (items) {
          this.toggleFrequentItemsList(true);
          this.store.setFrequentItems(items);
        } else {
          this.isLocalStorageFailed = true;
          this.toggleFrequentItemsList(true);
          this.store.setFrequentItems([]);
        }
      }
    },
    fetchSearchedItems(searchQuery) {
      this.searchQuery = searchQuery;
      this.toggleLoader(true);
      this.service
        .getSearchedItems(this.searchQuery)
        .then(res => res.json())
        .then(results => {
          this.toggleSearchItemsList(true);
          this.store.setSearchedItems(results);
        })
        .catch(() => {
          this.isSearchFailed = true;
          this.toggleSearchItemsList(true);
        });
    },
    logCurrentItemAccess() {
      this.service.logItemAccess(this.currentItem);
    },
    handleSearchClear() {
      this.searchQuery = '';
      this.toggleFrequentItemsList(true);
      this.store.clearSearchedItems();
    },
    handleSearchFailure() {
      this.isSearchFailed = true;
      this.toggleSearchItemsList(true);
    },
  },
};
</script>

<template>
  <div>
    <frequent-items-search-input
      :service="service"
    />
    <loading-icon
      class="loading-animation prepend-top-20"
      size="2"
      v-if="isLoadingItems"
      :label="translations.loadingMessage"
    />
    <div
      class="section-header"
      v-if="isItemsListVisible"
    >
      {{ translations.header }}
    </div>
    <frequent-items-list
      v-if="isItemsListVisible"
      :local-storage-failed="isLocalStorageFailed"
      :items="frequentItems"
      :service="service"
    />
    <frequent-items-search-list
      v-if="isSearchListVisible"
      :search-failed="isSearchFailed"
      :matcher="searchQuery"
      :items="searchItems"
      :service="service"
    />
  </div>
</template>
