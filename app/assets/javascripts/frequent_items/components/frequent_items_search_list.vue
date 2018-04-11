<script>
import frequentItemsListItem from './frequent_items_list_item.vue';

export default {
  components: {
    frequentItemsListItem,
  },
  props: {
    matcher: {
      type: String,
      required: true,
    },
    items: {
      type: Array,
      required: true,
    },
    searchFailed: {
      type: Boolean,
      required: true,
    },
    service: {
      type: Object,
      required: true,
    },
  },
  computed: {
    translations() {
      return this.service.getTranslations(['searchListErrorMessage', 'searchListEmptyMessage']);
    },
    isListEmpty() {
      return this.items.length === 0;
    },
    listEmptyMessage() {
      return this.searchFailed
        ? this.translations.searchListErrorMessage
        : this.translations.searchListEmptyMessage;
    },
  },
};
</script>

<template>
  <div
    class="projects-list-search-container"
  >
    <ul
      class="list-unstyled"
    >
      <li
        v-if="isListEmpty"
        :class="{ 'section-failure': searchFailed }"
        class="section-empty"
      >
        {{ listEmptyMessage }}
      </li>
      <frequent-items-list-item
        v-else
        v-for="(item, index) in items"
        :key="index"
        :item-id="item.id"
        :item-name="item.name"
        :namespace="item.namespace"
        :web-url="item.webUrl"
        :avatar-url="item.avatarUrl"
        :matcher="matcher"
      />
    </ul>
  </div>
</template>
