<script>
import { mapGetters, mapActions } from 'vuex';
import bs from '~/breakpoints';
import loadingIcon from '~/vue_shared/components/loading_icon.vue';

import eventHub from '../event_hub';
import store from '../stores/';
import frequentItemsSearchInput from './frequent_items_search_input.vue';
import frequentItemsList from './frequent_items_list.vue';
import frequentItemsSearchList from './frequent_items_search_list.vue';

export default {
  store,
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
    ...mapGetters(['frequentItems', 'searchedItems']),
    translations() {
      return this.service.getTranslations(['loadingMessage', 'header']);
    },
  },
  created() {
    if (this.currentItem.id) {
      this.logCurrentItemAccess();
    }

    eventHub.$on(`${this.namespace}-dropdownOpen`, this.fetchFrequentItems);
    eventHub.$on(`${this.namespace}-searchItems`, this.fetchSearchedItems);
    eventHub.$on(`${this.namespace}-searchCleared`, this.handleSearchClear);
    eventHub.$on(`${this.namespace}-searchFailed`, this.handleSearchFailure);
  },
  beforeDestroy() {
    eventHub.$off(`${this.namespace}-dropdownOpen`, this.fetchFrequentItems);
    eventHub.$off(`${this.namespace}-searchItems`, this.fetchSearchedItems);
    eventHub.$off(`${this.namespace}-searchCleared`, this.handleSearchClear);
    eventHub.$off(`${this.namespace}-searchFailed`, this.handleSearchFailure);
  },
  methods: {
    ...mapActions(['setFrequentItems', 'setSearchedItems', 'clearSearchedItems']),
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
          this.setFrequentItems(items);
        } else {
          this.isLocalStorageFailed = true;
          this.toggleFrequentItemsList(true);
          this.setFrequentItems([]);
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
          this.setSearchedItems(results);
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
      this.clearSearchedItems();
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
      :items="searchedItems"
      :service="service"
    />
  </div>
</template>
