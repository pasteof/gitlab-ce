<script>
import _ from 'underscore';
import eventHub from '../event_hub';

export default {
  props: {
    service: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      searchQuery: '',
    };
  },
  computed: {
    translations() {
      return this.service.getTranslations(['searchInputPlaceholder']);
    },
  },
  watch: {
    searchQuery() {
      this.handleInput();
    },
  },
  mounted() {
    eventHub.$on('dropdownOpen', this.setFocus);
  },
  beforeDestroy() {
    eventHub.$off('dropdownOpen', this.setFocus);
  },
  methods: {
    setFocus() {
      this.$refs.search.focus();
    },
    emitSearchEvents() {
      if (this.searchQuery) {
        eventHub.$emit(`${this.service.namespace}-searchItems`, this.searchQuery);
      } else {
        eventHub.$emit(`${this.service.namespace}-searchCleared`);
      }
    },
    /**
     * Callback function within _.debounce is intentionally
     * kept as ES5 `function() {}` instead of ES6 `() => {}`
     * as it otherwise messes up function context
     * and component reference is no longer accessible via `this`
     */
    // eslint-disable-next-line func-names
    handleInput: _.debounce(function() {
      this.emitSearchEvents();
    }, 500),
  },
};
</script>

<template>
  <div
    class="search-input-container hidden-xs"
  >
    <input
      type="search"
      class="form-control"
      ref="search"
      v-model="searchQuery"
      :placeholder="translations.searchInputPlaceholder"
    />
    <i
      v-if="!searchQuery"
      class="search-icon fa fa-fw fa-search"
      aria-hidden="true"
    >
    </i>
  </div>
</template>
