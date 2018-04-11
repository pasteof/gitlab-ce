<script>
import frequentItemsListItem from './frequent_items_list_item.vue';

export default {
  components: {
    frequentItemsListItem,
  },
  props: {
    items: {
      type: Array,
      required: true,
    },
    localStorageFailed: {
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
      return this.service.getTranslations(['itemListErrorMessage', 'itemListEmptyMessage']);
    },
    isListEmpty() {
      return this.items.length === 0;
    },
    listEmptyMessage() {
      return this.localStorageFailed
        ? this.translations.itemListErrorMessage
        : this.translations.itemListEmptyMessage;
    },
  },
};
</script>

<template>
  <div
    class="projects-list-frequent-container"
  >
    <ul
      class="list-unstyled"
    >
      <li
        class="section-empty"
        v-if="isListEmpty"
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
      />
    </ul>
  </div>
</template>
