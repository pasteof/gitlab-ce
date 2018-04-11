import $ from 'jquery';
import Vue from 'vue';

import Translate from '~/vue_shared/translate';
import eventHub from '~/frequent_items/event_hub';
import FrequentItemsService from '~/frequent_items/services/frequent_items_service';
import FrequentItemsStore from '~/frequent_items/stores/frequent_items_store';

import frequentItems from './components/app.vue';

Vue.use(Translate);

document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById('js-projects-dropdown');
  const navEl = document.getElementById('nav-projects-dropdown');
  const frequentProjectsNamespace = 'projects';

  // Don't do anything if element doesn't exist (No projects dropdown)
  // This is for when the user accesses GitLab without logging in
  if (!el || !navEl) {
    return;
  }

  $(navEl).on('shown.bs.dropdown', () => {
    eventHub.$emit('dropdownOpen');
  });

  // eslint-disable-next-line no-new
  new Vue({
    el,
    components: {
      frequentItems,
    },
    data() {
      const dataset = this.$options.el.dataset;
      const store = new FrequentItemsStore();
      const service = new FrequentItemsService(frequentProjectsNamespace, dataset.userName);

      const project = {
        id: Number(dataset.projectId),
        name: dataset.projectName,
        namespace: dataset.projectNamespace,
        webUrl: dataset.projectWebUrl,
        avatarUrl: dataset.projectAvatarUrl || null,
        lastAccessedOn: Date.now(),
      };

      return {
        store,
        service,
        state: store.state,
        currentUserName: dataset.userName,
        currentItem: project,
      };
    },
    render(createElement) {
      return createElement('frequent-items', {
        props: {
          namespace: frequentProjectsNamespace,
          currentUserName: this.currentUserName,
          currentItem: this.currentItem,
          store: this.store,
          service: this.service,
        },
      });
    },
  });
});
