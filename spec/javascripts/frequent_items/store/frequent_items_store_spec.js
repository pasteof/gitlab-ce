import FrequentItemsStore from '~/frequent_items/stores/frequent_items_store';
import { mockProject, mockRawProject } from '../mock_data';

describe('ItemsStore', () => {
  let store;

  beforeEach(() => {
    store = new FrequentItemsStore();
  });

  describe('setFrequentItems', () => {
    it('should set frequent items list to state', () => {
      store.setFrequentItems([mockProject]);

      expect(store.getFrequentItems().length).toBe(1);
      expect(store.getFrequentItems()[0].id).toBe(mockProject.id);
    });
  });

  describe('setSearchedItems', () => {
    it('should set searched items list to state', () => {
      store.setSearchedItems([mockRawProject]);

      const processedItems = store.getSearchedItems();
      expect(processedItems.length).toBe(1);
      expect(processedItems[0].id).toBe(mockRawProject.id);
      expect(processedItems[0].namespace).toBe(mockRawProject.name_with_namespace);
      expect(processedItems[0].webUrl).toBe(mockRawProject.web_url);
      expect(processedItems[0].avatarUrl).toBe(mockRawProject.avatar_url);
    });
  });

  describe('clearSearchedItems', () => {
    it('should clear searched items list from state', () => {
      store.setSearchedItems([mockRawProject]);
      expect(store.getSearchedItems().length).toBe(1);
      store.clearSearchedItems();
      expect(store.getSearchedItems().length).toBe(0);
    });
  });
});
