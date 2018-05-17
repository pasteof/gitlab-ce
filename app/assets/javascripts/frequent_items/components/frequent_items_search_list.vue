<script>
import FrequentItemsListItem from './frequent_items_list_item.vue';

export default {
  components: {
    FrequentItemsListItem,
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
    emptyMessage: {
      type: String,
      required: true,
    },
    errorMessage: {
      type: String,
      required: true,
    },
  },
  computed: {
    isListEmpty() {
      return this.items.length === 0;
    },
    listEmptyMessage() {
      return this.searchFailed ? this.errorMessage : this.emptyMessage;
    },
  },
};
</script>

<template>
  <div
    class="frequent-items-search-container"
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
