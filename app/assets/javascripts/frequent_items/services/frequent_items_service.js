import _ from 'underscore';
import Vue from 'vue';
import VueResource from 'vue-resource';

import { s__ } from '~/locale';
import bp from '~/breakpoints';
import Api from '~/api';
import AccessorUtilities from '~/lib/utils/accessor';

import { FREQUENT_ITEMS, HOUR_IN_MS, STORAGE_KEY, TRANSLATION_KEYS } from '../constants';

Vue.use(VueResource);

export default class FrequentItemsService {
  constructor(namespace, currentUserName) {
    this.namespace = namespace;
    this.currentUserName = currentUserName;
    this.isLocalStorageAvailable = AccessorUtilities.isLocalStorageAccessSafe();
    this.storageKey = `${this.currentUserName}/${STORAGE_KEY[namespace]}`;
    this.itemsPath = Vue.resource(Api.buildUrl(Api[`${namespace}Path`]));
    this.isMobile = () => bp.getBreakpointSize() === ('sm' || 'xs');
    this.existingFrequentItem = null;
  }

  getSearchedItems(searchQuery) {
    const params = {
      simple: true,
      per_page: 20,
      membership: !!gon.current_user_id,
      search: searchQuery,
    };

    if (this.namespace === 'projects') {
      params.order_by = 'last_activity_at';
    }

    return this.itemsPath.get(params);
  }

  getFrequentItems() {
    if (this.isLocalStorageAvailable) {
      const storedFrequentItems = JSON.parse(localStorage.getItem(this.storageKey));

      return !storedFrequentItems ? [] : this.getTopFrequentItems(storedFrequentItems);
    }

    return null;
  }

  logItemAccess(item) {
    if (!this.isLocalStorageAvailable) {
      return false;
    }

    // Check if there's any frequent items list set
    const storedRawItems = localStorage.getItem(this.storageKey);
    const storedFrequentItems = storedRawItems
      ? JSON.parse(storedRawItems)
      : [{ ...item, frequency: 1 }]; // No frequent items list set, set one up.

    // Check if item already exists in list
    const itemMatchIndex = _.findIndex(
      storedFrequentItems,
      frequentItem => frequentItem.id === item.id,
    );

    if (itemMatchIndex > -1) {
      this.existingFrequentItem = storedFrequentItems[itemMatchIndex];
      storedFrequentItems[itemMatchIndex] = this.updateExistingFrequentItem(item);
    } else {
      if (storedFrequentItems.length === FREQUENT_ITEMS.MAX_COUNT) {
        storedFrequentItems.shift();
      }

      storedFrequentItems.push({ ...item, frequency: 1 });
    }

    return localStorage.setItem(this.storageKey, JSON.stringify(storedFrequentItems));
  }

  updateExistingFrequentItem(item) {
    const frequentItem = this.existingFrequentItem;
    const accessedOverHourAgo =
      Math.abs(item.lastAccessedOn - frequentItem.lastAccessedOn) / HOUR_IN_MS > 1;

    return {
      ...item,
      frequency: accessedOverHourAgo ? frequentItem.frequency + 1 : frequentItem.frequency,
      lastAccessedOn: accessedOverHourAgo ? Date.now() : frequentItem.lastAccessedOn,
    };
  }

  getTopFrequentItems(items) {
    const frequentItemsCount = this.isMobile()
      ? FREQUENT_ITEMS.LIST_COUNT_MOBILE
      : FREQUENT_ITEMS.LIST_COUNT_DESKTOP;

    const frequentItems = items.filter(item => item.frequency >= FREQUENT_ITEMS.ELIGIBLE_FREQUENCY);

    frequentItems.sort((itemA, itemB) => {
      // Sort all frequent items in decending order of frequency
      // and then by lastAccessedOn with recent most first
      if (itemA.frequency !== itemB.frequency) {
        return itemB.frequency - itemA.frequency;
      } else if (itemA.lastAccessedOn !== itemB.lastAccessedOn) {
        return itemB.lastAccessedOn - itemA.lastAccessedOn;
      }

      return 0;
    });

    return _.first(frequentItems, frequentItemsCount);
  }

  // TODO: Should probably be moved to ~/locale for use with other components?
  getTranslations(keys) {
    const translationStrings = {};
    keys.forEach(key => {
      translationStrings[key] = s__(TRANSLATION_KEYS[this.namespace][key]);
    });

    return translationStrings;
  }
}
