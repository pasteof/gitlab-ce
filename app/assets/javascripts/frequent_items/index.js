import $ from 'jquery';
import Vue from 'vue';

import Translate from '~/vue_shared/translate';
import eventHub from '~/frequent_items/event_hub';
import FrequentItemsService from '~/frequent_items/services/frequent_items_service';
import FrequentItemsStore from '~/frequent_items/stores/frequent_items_store';

import frequentItems from './components/app.vue';

Vue.use(Translate);

const frequentItemDropdowns = ['projects', 'groups'];

document.addEventListener('DOMContentLoaded', () => {
  frequentItemDropdowns.forEach(itemType => {
    const el = document.getElementById(`js-${itemType}-dropdown`);
    const navEl = document.getElementById(`nav-${itemType}-dropdown`);

    // Don't do anything if element doesn't exist (No groups dropdown)
    // This is for when the user accesses GitLab without logging in
    if (!el || !navEl) {
      return;
    }

    $(navEl).on('shown.bs.dropdown', () => {
      eventHub.$emit(`${itemType}-dropdownOpen`);
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
        const service = new FrequentItemsService(itemType, dataset.userName);

        const item = {
          id: Number(dataset[`${itemType}Id`]),
          name: dataset[`${itemType}Name`],
          namespace: dataset[`${itemType}Namespace`],
          webUrl: dataset[`${itemType}WebUrl`],
          avatarUrl: dataset[`${itemType}AvatarUrl`] || null,
          lastAccessedOn: Date.now(),
        };

        return {
          store,
          service,
          state: store.state,
          currentUserName: dataset.userName,
          currentItem: item,
        };
      },
      render(createElement) {
        return createElement('frequent-items', {
          props: {
            namespace: itemType,
            currentUserName: this.currentUserName,
            currentItem: this.currentItem,
            store: this.store,
            service: this.service,
          },
        });
      },
    });
  });
});
