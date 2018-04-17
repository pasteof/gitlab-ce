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
    let matchFound = false;
    let storedFrequentItems;

    if (this.isLocalStorageAvailable) {
      const storedRawItems = localStorage.getItem(this.storageKey);

      // Check if there's any frequent items list set
      if (!storedRawItems) {
        // No frequent items list set, set one up.
        storedFrequentItems = [{ ...item, frequency: 1 }];
      } else {
        // Check if item is already present in items list
        // When found, update metadata of it.
        storedFrequentItems = JSON.parse(storedRawItems).map(frequentItem => {
          if (frequentItem.id === item.id) {
            matchFound = true;
            const accessedOverHourAgo =
              Math.abs(item.lastAccessedOn - frequentItem.lastAccessedOn) / HOUR_IN_MS > 1;

            // Check if duration since last access of this item
            // is over an hour
            return {
              ...item,
              frequency: accessedOverHourAgo ? frequentItem.frequency + 1 : frequentItem.frequency,
              lastAccessedOn: accessedOverHourAgo ? Date.now() : frequentItem.lastAccessedOn,
            };
          }

          return frequentItem;
        });

        // Make room for the new item if the list of frequent items is past 20.
        if (!matchFound) {
          // We always keep size of items collection to 20 items
          // out of which only 5 items with
          // highest value of `frequency` and most recent `lastAccessedOn`
          // are shown in items dropdown
          if (storedFrequentItems.length === FREQUENT_ITEMS.MAX_COUNT) {
            storedFrequentItems.shift();
          }

          storedFrequentItems.push({ ...item, frequency: 1 });
        }
      }

      localStorage.setItem(this.storageKey, JSON.stringify(storedFrequentItems));
    }
  }

  getTopFrequentItems(items) {
    const frequentItemsCount = this.isMobile()
      ? FREQUENT_ITEMS.LIST_COUNT_MOBILE
      : FREQUENT_ITEMS.LIST_COUNT_DESKTOP;

    const frequentItems = items.filter(item => item.frequency >= FREQUENT_ITEMS.ELIGIBLE_FREQUENCY);

    frequentItems.sort((itemA, itemB) => {
      // Sort all frequent items in decending order of frequency
      // and then by lastAccessedOn with recent most first
      if (itemA.frequency < itemB.frequency) {
        return 1;
      } else if (itemA.frequency > itemB.frequency) {
        return -1;
      } else if (itemA.lastAccessedOn < itemB.lastAccessedOn) {
        return 1;
      } else if (itemA.lastAccessedOn > itemB.lastAccessedOn) {
        return -1;
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
