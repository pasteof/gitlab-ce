import store from '~/frequent_items/store';
import { mockGroup, mockRawGroup, mockProject, mockRawProject } from '../mock_data';

describe('ItemsStore', () => {
  describe('receiveFrequentItemsSuccess', () => {
    it('should set frequent items list to state with project', done => {
      store
        .dispatch('receiveFrequentItemsSuccess', [mockProject])
        .then(() => {
          expect(store.state.frequentItems.length).toBe(1);
          expect(store.state.frequentItems[0].id).toBe(mockProject.id);
        })
        .then(done)
        .catch(done.fail);
    });

    it('should set frequent items list to state with group', done => {
      store
        .dispatch('setFrequentItems', [mockGroup])
        .then(() => {
          expect(store.state.frequentItems.length).toBe(1);
          expect(store.state.frequentItems[0].id).toBe(mockGroup.id);
        })
        .then(done)
        .catch(done.fail);
    });
  });

  describe('setSearchedItems', () => {
    it('should set searched items list to state with project', done => {
      store
        .dispatch('setSearchedItems', [mockRawProject])
        .then(() => {
          const processedItems = store.state.searchedItems;

          expect(processedItems.length).toBe(1);
          expect(processedItems[0].id).toBe(mockRawProject.id);
          expect(processedItems[0].namespace).toBe(mockRawProject.name_with_namespace);
          expect(processedItems[0].webUrl).toBe(mockRawProject.web_url);
          expect(processedItems[0].avatarUrl).toBe(mockRawProject.avatar_url);
        })
        .then(done)
        .catch(done.fail);
    });

    it('should set searched items list to state with group', done => {
      store
        .dispatch('setSearchedItems', [mockRawGroup])
        .then(() => {
          const processedItems = store.state.searchedItems;

          expect(processedItems.length).toBe(1);
          expect(processedItems[0].id).toBe(mockRawGroup.id);
          expect(processedItems[0].namespace).toBe(mockRawGroup.full_name);
          expect(processedItems[0].webUrl).toBe(mockRawGroup.web_url);
          expect(processedItems[0].avatarUrl).toBe(mockRawGroup.avatar_url);
        })
        .then(done)
        .catch(done.fail);
    });
  });

  describe('clearSearchedItems', () => {
    it('should clear searched items list from state with project', done => {
      store
        .dispatch('setSearchedItems', [mockRawProject])
        .then(() => {
          expect(store.state.searchedItems.length).toBe(1);

          store
            .dispatch('clearSearchedItems')
            .then(() => {
              expect(store.state.searchedItems.length).toBe(0);
            })
            .then(done)
            .catch(done.fail);
        })
        .catch(done.fail);
    });

    it('should clear searched items list from state with group', done => {
      store
        .dispatch('setSearchedItems', [mockRawGroup])
        .then(() => {
          expect(store.state.searchedItems.length).toBe(1);

          store
            .dispatch('clearSearchedItems')
            .then(() => {
              expect(store.state.searchedItems.length).toBe(0);
            })
            .then(done)
            .catch(done.fail);
        })
        .catch(done.fail);
    });
  });
});
