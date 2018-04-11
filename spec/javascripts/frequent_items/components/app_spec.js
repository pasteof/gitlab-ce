// TODO: Add tests for groups context
import Vue from 'vue';

import bp from '~/breakpoints';
import appComponent from '~/frequent_items/components/app.vue';
import eventHub from '~/frequent_items/event_hub';
import FrequentItemsService from '~/frequent_items/services/frequent_items_service';
import FrequentItemsStore from '~/frequent_items/stores/frequent_items_store';

import mountComponent from 'spec/helpers/vue_mount_component_helper';
import { currentSession, mockGroup, mockRawGroup, mockProject, mockRawProject } from '../mock_data';

const createComponent = context => {
  const session = currentSession[context];
  gon.api_version = session.apiVersion;
  const Component = Vue.extend(appComponent);
  const store = new FrequentItemsStore();
  const service = new FrequentItemsService(context, session.username);

  return mountComponent(Component, {
    namespace: context,
    store,
    service,
    currentUserName: session.username,
    currentItem: session.project || session.group,
  });
};

const returnServicePromise = (data, failed) => new Promise((resolve, reject) => {
  if (failed) {
    reject(data);
  } else {
    resolve({
      json() {
        return data;
      },
    });
  }
});

describe('AppComponent', () => {
  describe('computed', () => {
    let vm1;
    let vm2;

    beforeEach(() => {
      vm1 = createComponent('projects');
      vm2 = createComponent('groups');
    });

    afterEach(() => {
      vm1.$destroy();
      vm2.$destroy();
    });

    describe('frequentItems', () => {
      it('should return list of frequently accessed projects from store', () => {
        expect(vm1.frequentItems).toBeDefined();
        expect(vm1.frequentItems.length).toBe(0);

        vm1.store.setFrequentItems([mockProject]);
        expect(vm1.frequentItems).toBeDefined();
        expect(vm1.frequentItems.length).toBe(1);
      });

      it('should return list of frequently accessed groups from store', () => {
        expect(vm2.frequentItems).toBeDefined();
        expect(vm2.frequentItems.length).toBe(0);

        vm2.store.setFrequentItems([mockGroup]);
        expect(vm2.frequentItems).toBeDefined();
        expect(vm2.frequentItems.length).toBe(1);
      });
    });

    describe('searchItems', () => {
      it('should return list of frequently accessed projects from search endpoint', () => {
        expect(vm1.searchItems).toBeDefined();
        expect(vm1.searchItems.length).toBe(0);

        vm1.store.setSearchedItems([mockRawProject]);
        expect(vm1.searchItems).toBeDefined();
        expect(vm1.searchItems.length).toBe(1);
      });

      it('should return list of frequently accessed groups from search endpoint', () => {
        expect(vm2.searchItems).toBeDefined();
        expect(vm2.searchItems.length).toBe(0);

        vm2.store.setSearchedItems([mockRawGroup]);
        expect(vm2.searchItems).toBeDefined();
        expect(vm2.searchItems.length).toBe(1);
      });
    });
  });

  describe('methods', () => {
    let vm1;
    let vm2;

    beforeEach(() => {
      vm1 = createComponent('projects');
      vm2 = createComponent('groups');
    });

    afterEach(() => {
      vm1.$destroy();
      vm2.$destroy();
    });

    describe('toggleFrequentItemsList', () => {
      it('should toggle props which control visibility of Frequent Items list from state passed', () => {
        vm1.toggleFrequentItemsList(true);
        expect(vm1.isLoadingItems).toBeFalsy();
        expect(vm1.isSearchListVisible).toBeFalsy();
        expect(vm1.isItemsListVisible).toBeTruthy();

        vm1.toggleFrequentItemsList(false);
        expect(vm1.isLoadingItems).toBeTruthy();
        expect(vm1.isSearchListVisible).toBeTruthy();
        expect(vm1.isItemsListVisible).toBeFalsy();
      });
    });

    describe('toggleSearchItemsList', () => {
      it('should toggle props which control visibility of Searched Items list from state passed', () => {
        vm1.toggleSearchItemsList(true);
        expect(vm1.isLoadingItems).toBeFalsy();
        expect(vm1.isItemsListVisible).toBeFalsy();
        expect(vm1.isSearchListVisible).toBeTruthy();

        vm1.toggleSearchItemsList(false);
        expect(vm1.isLoadingItems).toBeTruthy();
        expect(vm1.isItemsListVisible).toBeTruthy();
        expect(vm1.isSearchListVisible).toBeFalsy();
      });
    });

    describe('toggleLoader', () => {
      it('should toggle props which control visibility of list loading animation from state passed', () => {
        vm1.toggleLoader(true);
        expect(vm1.isItemsListVisible).toBeFalsy();
        expect(vm1.isSearchListVisible).toBeFalsy();
        expect(vm1.isLoadingItems).toBeTruthy();

        vm1.toggleLoader(false);
        expect(vm1.isItemsListVisible).toBeTruthy();
        expect(vm1.isSearchListVisible).toBeTruthy();
        expect(vm1.isLoadingItems).toBeFalsy();
      });
    });

    describe('fetchFrequentItems', () => {
      it('should set props for loading animation to `true` while frequent projects list is being loaded', () => {
        spyOn(vm1, 'toggleLoader');

        vm1.fetchFrequentItems();
        expect(vm1.isLocalStorageFailed).toBeFalsy();
        expect(vm1.toggleLoader).toHaveBeenCalledWith(true);
      });

      it('should set props for loading animation to `false` and props for frequent projects list to `true` once data is loaded', () => {
        const mockData = [mockProject];

        spyOn(vm1.service, 'getFrequentItems').and.returnValue(mockData);
        spyOn(vm1.store, 'setFrequentItems');
        spyOn(vm1, 'toggleFrequentItemsList');

        vm1.fetchFrequentItems();
        expect(vm1.service.getFrequentItems).toHaveBeenCalled();
        expect(vm1.store.setFrequentItems).toHaveBeenCalledWith(mockData);
        expect(vm1.toggleFrequentItemsList).toHaveBeenCalledWith(true);
      });

      it('should set props for loading animation to `false` and props for frequent groups list to `true` once data is loaded', () => {
        const mockData = [mockGroup];

        spyOn(vm2.service, 'getFrequentItems').and.returnValue(mockData);
        spyOn(vm2.store, 'setFrequentItems');
        spyOn(vm2, 'toggleFrequentItemsList');

        vm2.fetchFrequentItems();
        expect(vm2.service.getFrequentItems).toHaveBeenCalled();
        expect(vm2.store.setFrequentItems).toHaveBeenCalledWith(mockData);
        expect(vm2.toggleFrequentItemsList).toHaveBeenCalledWith(true);
      });

      it('should set props for failure message to `true` when method fails to fetch frequent projects list', () => {
        spyOn(vm1.service, 'getFrequentItems').and.returnValue(null);
        spyOn(vm1.store, 'setFrequentItems');
        spyOn(vm1, 'toggleFrequentItemsList');

        expect(vm1.isLocalStorageFailed).toBeFalsy();

        vm1.fetchFrequentItems();
        expect(vm1.service.getFrequentItems).toHaveBeenCalled();
        expect(vm1.store.setFrequentItems).toHaveBeenCalledWith([]);
        expect(vm1.toggleFrequentItemsList).toHaveBeenCalledWith(true);
        expect(vm1.isLocalStorageFailed).toBeTruthy();
      });

      it('should set props for search results list to `true` if search query was already made previously', () => {
        spyOn(bp, 'getBreakpointSize').and.returnValue('md');
        spyOn(vm1.service, 'getFrequentItems');
        spyOn(vm1, 'toggleSearchItemsList');

        vm1.searchQuery = 'test';
        vm1.fetchFrequentItems();
        expect(vm1.service.getFrequentItems).not.toHaveBeenCalled();
        expect(vm1.toggleSearchItemsList).toHaveBeenCalledWith(true);
      });

      it('should set props for frequent projects list to `true` if search query was already made but screen size is less than 768px', () => {
        spyOn(bp, 'getBreakpointSize').and.returnValue('sm');
        spyOn(vm1, 'toggleSearchItemsList');
        spyOn(vm1.service, 'getFrequentItems');

        vm1.searchQuery = 'test';
        vm1.fetchFrequentItems();
        expect(vm1.service.getFrequentItems).toHaveBeenCalled();
        expect(vm1.toggleSearchItemsList).not.toHaveBeenCalled();
      });
    });

    describe('fetchSearchedItems', () => {
      const searchQuery = 'test';

      it('should perform project search with provided search query', (done) => {
        const mockData = [mockRawProject];
        spyOn(vm1, 'toggleLoader');
        spyOn(vm1, 'toggleSearchItemsList');
        spyOn(vm1.service, 'getSearchedItems').and.returnValue(returnServicePromise(mockData));
        spyOn(vm1.store, 'setSearchedItems');

        vm1.fetchSearchedItems(searchQuery);
        setTimeout(() => {
          expect(vm1.searchQuery).toBe(searchQuery);
          expect(vm1.toggleLoader).toHaveBeenCalledWith(true);
          expect(vm1.service.getSearchedItems).toHaveBeenCalledWith(searchQuery);
          expect(vm1.toggleSearchItemsList).toHaveBeenCalledWith(true);
          expect(vm1.store.setSearchedItems).toHaveBeenCalledWith(mockData);
          done();
        }, 0);
      });

      it('should perform group search with provided search query', (done) => {
        const mockData = [mockRawGroup];
        spyOn(vm2, 'toggleLoader');
        spyOn(vm2, 'toggleSearchItemsList');
        spyOn(vm2.service, 'getSearchedItems').and.returnValue(returnServicePromise(mockData));
        spyOn(vm2.store, 'setSearchedItems');

        vm2.fetchSearchedItems(searchQuery);
        setTimeout(() => {
          expect(vm2.searchQuery).toBe(searchQuery);
          expect(vm2.toggleLoader).toHaveBeenCalledWith(true);
          expect(vm2.service.getSearchedItems).toHaveBeenCalledWith(searchQuery);
          expect(vm2.toggleSearchItemsList).toHaveBeenCalledWith(true);
          expect(vm2.store.setSearchedItems).toHaveBeenCalledWith(mockData);
          done();
        }, 0);
      });

      it('should update props for showing search failure', (done) => {
        spyOn(vm1, 'toggleSearchItemsList');
        spyOn(vm1.service, 'getSearchedItems').and.returnValue(returnServicePromise({}, true));

        vm1.fetchSearchedItems(searchQuery);
        setTimeout(() => {
          expect(vm1.searchQuery).toBe(searchQuery);
          expect(vm1.service.getSearchedItems).toHaveBeenCalledWith(searchQuery);
          expect(vm1.isSearchFailed).toBeTruthy();
          expect(vm1.toggleSearchItemsList).toHaveBeenCalledWith(true);
          done();
        }, 0);
      });
    });

    describe('logCurrentItemAccess', () => {
      it('should log current project access via service', (done) => {
        spyOn(vm1.service, 'logItemAccess');

        vm1.currentItem = mockProject;
        vm1.logCurrentItemAccess();

        setTimeout(() => {
          expect(vm1.service.logItemAccess).toHaveBeenCalledWith(mockProject);
          done();
        }, 1);
      });
    });

    describe('handleSearchClear', () => {
      it('should show frequent projects list when search input is cleared', () => {
        spyOn(vm1.store, 'clearSearchedItems');
        spyOn(vm1, 'toggleFrequentItemsList');

        vm1.handleSearchClear();

        expect(vm1.toggleFrequentItemsList).toHaveBeenCalledWith(true);
        expect(vm1.store.clearSearchedItems).toHaveBeenCalled();
        expect(vm1.searchQuery).toBe('');
      });
    });

    describe('handleSearchFailure', () => {
      it('should show failure message within dropdown', () => {
        spyOn(vm1, 'toggleSearchItemsList');

        vm1.handleSearchFailure();
        expect(vm1.toggleSearchItemsList).toHaveBeenCalledWith(true);
        expect(vm1.isSearchFailed).toBeTruthy();
      });
    });
  });

  describe('created', () => {
    it('should bind event listeners on eventHub', (done) => {
      const context = 'projects';
      spyOn(eventHub, '$on');

      createComponent(context).$mount();

      Vue.nextTick(() => {
        expect(eventHub.$on).toHaveBeenCalledWith(`${context}-dropdownOpen`, jasmine.any(Function));
        expect(eventHub.$on).toHaveBeenCalledWith(`${context}-searchItems`, jasmine.any(Function));
        expect(eventHub.$on).toHaveBeenCalledWith(`${context}-searchCleared`, jasmine.any(Function));
        expect(eventHub.$on).toHaveBeenCalledWith(`${context}-searchFailed`, jasmine.any(Function));
        done();
      });
    });
  });

  describe('beforeDestroy', () => {
    it('should unbind event listeners on eventHub', (done) => {
      const context = 'projects';
      const vm = createComponent(context);
      spyOn(eventHub, '$off');

      vm.$mount();
      vm.$destroy();

      Vue.nextTick(() => {
        expect(eventHub.$off).toHaveBeenCalledWith(`${context}-dropdownOpen`, jasmine.any(Function));
        expect(eventHub.$off).toHaveBeenCalledWith(`${context}-searchItems`, jasmine.any(Function));
        expect(eventHub.$off).toHaveBeenCalledWith(`${context}-searchCleared`, jasmine.any(Function));
        expect(eventHub.$off).toHaveBeenCalledWith(`${context}-searchFailed`, jasmine.any(Function));
        done();
      });
    });
  });

  describe('template', () => {
    let vm;

    beforeEach(() => {
      vm = createComponent('projects');
    });

    afterEach(() => {
      vm.$destroy();
    });

    it('should render search input', () => {
      expect(vm.$el.querySelector('.search-input-container')).toBeDefined();
    });

    it('should render loading animation', (done) => {
      vm.toggleLoader(true);
      Vue.nextTick(() => {
        const loadingEl = vm.$el.querySelector('.loading-animation');

        expect(loadingEl).toBeDefined();
        expect(loadingEl.classList.contains('prepend-top-20')).toBeTruthy();
        expect(loadingEl.querySelector('i').getAttribute('aria-label')).toBe('Loading projects');
        done();
      });
    });

    it('should render frequent projects list header', (done) => {
      vm.toggleFrequentItemsList(true);
      Vue.nextTick(() => {
        const sectionHeaderEl = vm.$el.querySelector('.section-header');

        expect(sectionHeaderEl).toBeDefined();
        expect(sectionHeaderEl.innerText.trim()).toBe('Frequently visited');
        done();
      });
    });

    it('should render frequent projects list', (done) => {
      vm.toggleFrequentItemsList(true);
      Vue.nextTick(() => {
        expect(vm.$el.querySelector('.frequent-items-list-container')).toBeDefined();
        done();
      });
    });

    it('should render searched projects list', (done) => {
      vm.toggleSearchItemsList(true);
      Vue.nextTick(() => {
        expect(vm.$el.querySelector('.section-header')).toBe(null);
        expect(vm.$el.querySelector('.frequent-items-search-container')).toBeDefined();
        done();
      });
    });
  });
});
