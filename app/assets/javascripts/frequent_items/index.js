import $ from 'jquery';
import Vue from 'vue';

import Translate from '~/vue_shared/translate';
import eventHub from '~/frequent_items/event_hub';
import FrequentItemsService from '~/frequent_items/services/frequent_items_service';

import frequentItems from './components/app.vue';

Vue.use(Translate);

const frequentItemDropdowns = [
  {
    namespace: 'projects',
    datasetKey: 'project',
  },
  {
    namespace: 'groups',
    datasetKey: 'group',
  },
];

document.addEventListener('DOMContentLoaded', () => {
  frequentItemDropdowns.forEach(dropdown => {
    const { namespace, datasetKey } = dropdown;
    const el = document.getElementById(`js-${namespace}-dropdown`);
    const navEl = document.getElementById(`nav-${namespace}-dropdown`);

    // Don't do anything if element doesn't exist (No groups dropdown)
    // This is for when the user accesses GitLab without logging in
    if (!el || !navEl) {
      return;
    }

    $(navEl).on('shown.bs.dropdown', () => {
      eventHub.$emit(`${namespace}-dropdownOpen`);
    });

    // eslint-disable-next-line no-new
    new Vue({
      el,
      components: {
        frequentItems,
      },
      data() {
        const dataset = this.$options.el.dataset;
        const service = new FrequentItemsService(namespace, dataset.userName);

        const item = {
          id: Number(dataset[`${datasetKey}Id`]),
          name: dataset[`${datasetKey}Name`],
          namespace: dataset[`${datasetKey}Namespace`],
          webUrl: dataset[`${datasetKey}WebUrl`],
          avatarUrl: dataset[`${datasetKey}AvatarUrl`] || null,
          lastAccessedOn: Date.now(),
        };

        return {
          service,
          currentUserName: dataset.userName,
          currentItem: item,
        };
      },
      render(createElement) {
        return createElement('frequent-items', {
          props: {
            namespace,
            currentUserName: this.currentUserName,
            currentItem: this.currentItem,
            service: this.service,
          },
        });
      },
    });
  });
});
