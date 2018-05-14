<script>
import _ from 'underscore';
import { mapState, mapActions } from 'vuex';
import bs from '~/breakpoints';
import LoadingIcon from '~/vue_shared/components/loading_icon.vue';

import eventHub from '../event_hub';
import store, { storeModule } from '../store/';
import { VIEW_STATES, STORAGE_KEY } from '../constants';
import FrequentItemsSearchInput from './frequent_items_search_input.vue';
import FrequentItemsList from './frequent_items_list.vue';
import FrequentItemsSearchList from './frequent_items_search_list.vue';
import mixin from './mixin';

export default {
  store,
  components: {
    LoadingIcon,
    FrequentItemsSearchInput,
    FrequentItemsList,
    FrequentItemsSearchList,
  },
  mixins: [mixin],
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
  data() {
    return {
      [VIEW_STATES.IS_LOADING_ITEMS]: false,
      [VIEW_STATES.IS_ITEMS_LIST_VISIBLE]: false,
      [VIEW_STATES.IS_SEARCH_LIST_VISIBLE]: false,
      isLocalStorageFailed: false,
      isSearchFailed: false,
    };
  },
  computed: {
    ...mapState({
      searchQuery(state, getters) {
        return getters[`${this.namespace}/searchQuery`];
      },
      frequentItems(state, getters) {
        return getters[`${this.namespace}/frequentItems`];
      },
      searchedItems(state, getters) {
        return getters[`${this.namespace}/searchedItems`];
      },
    }),
    translations() {
      return this.getTranslations(['loadingMessage', 'header']);
    },
  },
  watch: {
    searchQuery(val) {
      if (val === '') {
        this.toggleViewStates(VIEW_STATES.IS_ITEMS_LIST_VISIBLE);
      } else {
        this.toggleViewStates(VIEW_STATES.IS_LOADING_ITEMS);
        this.fetchSearchedItems(this.searchQuery).catch(() => {
          this.isSearchFailed = true;
          this.toggleViewStates(VIEW_STATES.IS_SEARCH_LIST_VISIBLE);
        });
      }
    },
    frequentItems(items) {
      if (!items) {
        this.isLocalStorageFailed = true;
      }

      this.toggleViewStates(VIEW_STATES.IS_ITEMS_LIST_VISIBLE);
    },
    searchedItems(items) {
      if (items) {
        this.toggleViewStates(VIEW_STATES.IS_SEARCH_LIST_VISIBLE);
      }
    },
  },
  created() {
    const { namespace, currentUserName } = this;

    store.registerModule(this.namespace, {
      ...storeModule,
      state: {
        ...storeModule.state,
        namespace,
        currentUserName,
        storageKey: `${currentUserName}/${STORAGE_KEY[namespace]}`,
      },
    });

    if (this.currentItem.id) {
      this.logCurrentItemAccess(this.currentItem);
    }

    eventHub.$on(`${this.namespace}-dropdownOpen`, this.dropdownOpenHandler);
  },
  beforeDestroy() {
    eventHub.$off(`${this.namespace}-dropdownOpen`, this.dropdownOpenHandler);
  },
  methods: {
    ...mapActions({
      logCurrentItemAccess(dispatch, payload) {
        return dispatch(`${this.namespace}/logItemAccess`, payload);
      },
      fetchFrequentItems(dispatch) {
        return dispatch(`${this.namespace}/fetchFrequentItems`);
      },
      fetchSearchedItems(dispatch, payload) {
        return dispatch(`${this.namespace}/fetchSearchedItems`, payload);
      },
    }),
    toggleViewStates(viewToEnable) {
      const views = _.values(VIEW_STATES);

      views.forEach(view => {
        this[view] = view === viewToEnable;
      });
    },
    dropdownOpenHandler() {
      const screenSize = bs.getBreakpointSize();
      if (this.searchQuery && screenSize !== ('sm' && 'xs')) {
        this.toggleViewStates(VIEW_STATES.IS_SEARCH_LIST_VISIBLE);
      } else {
        this.toggleViewStates(VIEW_STATES.IS_LOADING_ITEMS);
        this.isLocalStorageFailed = false;

        this.fetchFrequentItems();
      }
    },
  },
};
</script>

<template>
  <div>
    <frequent-items-search-input
      :namespace="namespace"
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
      :namespace="namespace"
    />
    <frequent-items-search-list
      v-if="isSearchListVisible"
      :search-failed="isSearchFailed"
      :matcher="searchQuery"
      :items="searchedItems"
      :namespace="namespace"
    />
  </div>
</template>
