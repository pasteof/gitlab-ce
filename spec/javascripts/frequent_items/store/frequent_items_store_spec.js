import FrequentItemsStore from '~/frequent_items/stores/frequent_items_store';
import { mockGroup, mockRawGroup, mockProject, mockRawProject } from '../mock_data';

describe('ItemsStore', () => {
  let store;

  beforeEach(() => {
    store = new FrequentItemsStore();
  });

  describe('setFrequentItems', () => {
    it('should set frequent items list to state with project', () => {
      store.setFrequentItems([mockProject]);

      expect(store.getFrequentItems().length).toBe(1);
      expect(store.getFrequentItems()[0].id).toBe(mockProject.id);
    });

    it('should set frequent items list to state with group', () => {
      store.setFrequentItems([mockGroup]);

      expect(store.getFrequentItems().length).toBe(1);
      expect(store.getFrequentItems()[0].id).toBe(mockGroup.id);
    });

  });

  describe('setSearchedItems', () => {
    it('should set searched items list to state with project', () => {
      store.setSearchedItems([mockRawProject]);

      const processedItems = store.getSearchedItems();
      expect(processedItems.length).toBe(1);
      expect(processedItems[0].id).toBe(mockRawProject.id);
      expect(processedItems[0].namespace).toBe(mockRawProject.name_with_namespace);
      expect(processedItems[0].webUrl).toBe(mockRawProject.web_url);
      expect(processedItems[0].avatarUrl).toBe(mockRawProject.avatar_url);
    });

    it('should set searched items list to state with group', () => {
      store.setSearchedItems([mockRawGroup]);

      const processedItems = store.getSearchedItems();
      expect(processedItems.length).toBe(1);
      expect(processedItems[0].id).toBe(mockRawGroup.id);
      expect(processedItems[0].namespace).toBe(mockRawGroup.full_name);
      expect(processedItems[0].webUrl).toBe(mockRawGroup.web_url);
      expect(processedItems[0].avatarUrl).toBe(mockRawGroup.avatar_url);
    });
  });

  describe('clearSearchedItems', () => {
    it('should clear searched items list from state with project', () => {
      store.setSearchedItems([mockRawProject]);
      expect(store.getSearchedItems().length).toBe(1);
      store.clearSearchedItems();
      expect(store.getSearchedItems().length).toBe(0);
    });

    it('should clear searched items list from state with group', () => {
      store.setSearchedItems([mockRawGroup]);
      expect(store.getSearchedItems().length).toBe(1);
      store.clearSearchedItems();
      expect(store.getSearchedItems().length).toBe(0);
    });
  });
});
