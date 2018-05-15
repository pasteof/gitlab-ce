import _ from 'underscore';
import bp from '~/breakpoints';
import AccessorUtilities from '~/lib/utils/accessor';

import { VIEW_STATES, FREQUENT_ITEMS, HOUR_IN_MS } from '../constants';

const isMobile = () => bp.getBreakpointSize() === ('sm' && 'xs');

export const isLocalStorageAvailable = AccessorUtilities.isLocalStorageAccessSafe();

export const toggleViewStates = (state, viewToEnable) => {
  const newState = { ...state };
  const views = _.values(VIEW_STATES);

  views.forEach(view => {
    newState[view] = view === viewToEnable;
  });

  return newState;
};

export const getTopFrequentItems = items => {
  if (!items) {
    return [];
  }
  const frequentItemsCount = isMobile()
    ? FREQUENT_ITEMS.LIST_COUNT_MOBILE
    : FREQUENT_ITEMS.LIST_COUNT_DESKTOP;

  const frequentItems = items.filter(item => item.frequency >= FREQUENT_ITEMS.ELIGIBLE_FREQUENCY);

  if (!frequentItems || frequentItems.length === 0) {
    return [];
  }

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
