import _ from 'underscore';
import bp from '~/breakpoints';
import AccessorUtilities from '~/lib/utils/accessor';

import { FREQUENT_ITEMS, HOUR_IN_MS } from '../constants';

const isMobile = () => bp.getBreakpointSize() === ('sm' && 'xs');

export const isLocalStorageAvailable = AccessorUtilities.isLocalStorageAccessSafe();

export const getTopFrequentItems = items => {
  const frequentItemsCount = isMobile()
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
};

export const updateExistingFrequentItem = (frequentItem, item) => {
  const accessedOverHourAgo =
    Math.abs(item.lastAccessedOn - frequentItem.lastAccessedOn) / HOUR_IN_MS > 1;

  return {
    ...item,
    frequency: accessedOverHourAgo ? frequentItem.frequency + 1 : frequentItem.frequency,
    lastAccessedOn: accessedOverHourAgo ? Date.now() : frequentItem.lastAccessedOn,
  };
};
