<script>
import { mapState, mapActions } from 'vuex';
import LoadingIcon from '~/vue_shared/components/loading_icon.vue';

import store, { storeModule } from '../store/';
import { STORAGE_KEY } from '../constants';
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
      isLocalStorageFailed(state, getters) {
        return getters[`${this.namespace}/isLocalStorageFailed`];
      },
      isSearchFailed(state, getters) {
        return getters[`${this.namespace}/isSearchFailed`];
      },
      isLoadingItems(state, getters) {
        return getters[`${this.namespace}/isLoadingItems`];
      },
      isItemsListVisible(state, getters) {
        return getters[`${this.namespace}/isItemsListVisible`];
      },
      isSearchListVisible(state, getters) {
        return getters[`${this.namespace}/isSearchListVisible`];
      },
    }),
    translations() {
      return this.getTranslations(['loadingMessage', 'header']);
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
      this.logItemAccess(this.currentItem);
    }

    this.fetchFrequentItems();
  },
  methods: {
    ...mapActions({
      logItemAccess(dispatch, payload) {
        return dispatch(`${this.namespace}/logItemAccess`, payload);
      },
      fetchFrequentItems(dispatch) {
        return dispatch(`${this.namespace}/fetchFrequentItems`);
      },
    }),
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
