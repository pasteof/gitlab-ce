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
      state(state) {
        return state[this.namespace];
      },
    }),
    translations() {
      return this.getTranslations(['loadingMessage', 'header']);
    },
  },
  beforeCreate() {
    const { namespace, currentUserName } = this.$options.propsData;

    store.registerModule(namespace, {
      ...storeModule,
      state: {
        ...storeModule.state,
        namespace,
        currentUserName,
        storageKey: `${currentUserName}/${STORAGE_KEY[namespace]}`,
      },
    });
  },
  created() {
    const { currentItem } = this;

    if (currentItem.id) {
      this.logItemAccess(currentItem);
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
      v-if="state.isLoadingItems"
      :label="translations.loadingMessage"
    />
    <div
      class="section-header"
      v-if="state.isItemsListVisible"
    >
      {{ translations.header }}
    </div>
    <frequent-items-list
      v-if="state.isItemsListVisible"
      :local-storage-failed="state.isLocalStorageFailed"
      :items="state.frequentItems"
      :namespace="namespace"
    />
    <frequent-items-search-list
      v-if="state.isSearchListVisible"
      :search-failed="state.isSearchFailed"
      :matcher="state.searchQuery"
      :items="state.searchedItems"
      :namespace="namespace"
    />
  </div>
</template>
