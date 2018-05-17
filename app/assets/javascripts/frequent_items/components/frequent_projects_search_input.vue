<script>
import _ from 'underscore';

import eventHub from '../event_hub';

export default {
  data() {
    return {
      searchQuery: '',
    };
  },
  watch: {
    /**
     * Callback function within _.debounce is intentionally
     * kept as ES5 `function() {}` instead of ES6 `() => {}`
     * as it otherwise messes up function context
     * and component reference is no longer accessible via `this`
     */
    // eslint-disable-next-line func-names
    searchQuery: _.debounce(function() {
      this.$store.dispatch('setSearchQuery', this.searchQuery);
    }, 500),
  },
  mounted() {
    eventHub.$on('projects-dropdownOpen', this.setFocus);
  },
  beforeDestroy() {
    eventHub.$off('projects-dropdownOpen', this.setFocus);
  },
  methods: {
    setFocus() {
      this.$refs.search.focus();
    },
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
      :placeholder="s__('ProjectsDropdown|Search your projects')"
    />
    <i
      v-if="!searchQuery"
      class="search-icon fa fa-fw fa-search"
      aria-hidden="true"
    >
    </i>
  </div>
</template>
