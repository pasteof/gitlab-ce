<script>
import FrequentItemsListItem from './frequent_items_list_item.vue';
import mixin from './mixin';

export default {
  components: {
    FrequentItemsListItem,
  },
  mixins: [mixin],
  props: {
    items: {
      type: Array,
      required: true,
    },
    localStorageFailed: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    translations() {
      return this.getTranslations(['itemListErrorMessage', 'itemListEmptyMessage']);
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
    class="frequent-items-list-container"
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
