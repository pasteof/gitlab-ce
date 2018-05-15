import Vue from 'vue';

import bp from '~/breakpoints';
import appComponent from '~/frequent_items/components/app.vue';
import eventHub from '~/frequent_items/event_hub';
import store from '~/frequent_items/store';

import { mountComponentWithStore } from 'spec/helpers/vue_mount_component_helper';
import { currentSession, mockGroup, mockRawGroup, mockProject, mockRawProject } from '../mock_data';

const createComponentWithStore = namespace => {
  const session = currentSession[namespace];
  gon.api_version = session.apiVersion;
  const Component = Vue.extend(appComponent);

  return mountComponentWithStore(Component, {
    store,
    props: {
      namespace,
      currentUserName: session.username,
      currentItem: session.project || session.group,
    },
  });
};

const returnServicePromise = (data, failed) =>
  new Promise((resolve, reject) => {
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
      vm1 = createComponentWithStore('projects');
      vm2 = createComponentWithStore('groups');

      vm1.$store.replaceState({
        frequentItems: [],
        searchedItems: [],
      });
      vm2.$store.replaceState({
        frequentItems: [],
        searchedItems: [],
      });
    });

    afterEach(() => {
      vm1.$destroy();
      vm2.$destroy();
    });

    describe('frequentItems', () => {
      it('should return list of frequently accessed projects from store', () => {
        expect(vm1.frequentItems).toBeDefined();
        expect(vm1.frequentItems.length).toBe(0);

        vm1.setFrequentItems([mockProject]);
        expect(vm1.frequentItems).toBeDefined();
        expect(vm1.frequentItems.length).toBe(1);
      });

      it('should return list of frequently accessed groups from store', () => {
        expect(vm2.frequentItems).toBeDefined();
        expect(vm2.frequentItems.length).toBe(0);

        vm2.setFrequentItems([mockGroup]);
        expect(vm2.frequentItems).toBeDefined();
        expect(vm2.frequentItems.length).toBe(1);
      });
    });

    describe('searchItems', () => {
      it('should return list of frequently accessed projects from search endpoint', () => {
        expect(vm1.$store.state.searchedItems).toBeDefined();
        expect(vm1.$store.state.searchedItems.length).toBe(0);

        vm1.setSearchedItems([mockRawProject]);
        expect(vm1.$store.state.searchedItems).toBeDefined();
        expect(vm1.$store.state.searchedItems.length).toBe(1);
      });

      it('should return list of frequently accessed groups from search endpoint', () => {
        expect(vm2.$store.state.searchedItems).toBeDefined();
        expect(vm2.$store.state.searchedItems.length).toBe(0);

        vm2.setSearchedItems([mockRawGroup]);
        expect(vm2.$store.state.searchedItems).toBeDefined();
        expect(vm2.$store.state.searchedItems.length).toBe(1);
      });
    });
  });

  describe('methods', () => {
    const vm1Namespace = 'projects';
    const vm2Namespace = 'groups';
    let vm1;
    let vm2;

    beforeEach(() => {
      vm1 = createComponentWithStore(vm1Namespace);
      vm2 = createComponentWithStore(vm2Namespace);
    });

    afterEach(() => {
      vm1.$destroy();
      vm2.$destroy();
    });

    describe('isItemsListVisible', () => {
      it('should toggle props which control visibility of Frequent Items list from state passed', () => {
        expect(vm1.state.isLoadingItems).toBeFalsy();
        expect(vm1.state.isSearchListVisible).toBeFalsy();
        expect(vm1.state.isItemsListVisible).toBeTruthy();

        vm1.$store.dispatch(`${vm1Namespace}/requestSearchedItems`);
        expect(vm1.state.isLoadingItems).toBeTruthy();
        expect(vm1.state.isSearchListVisible).toBeFalsy();
        expect(vm1.state.isItemsListVisible).toBeFalsy();
      });
    });

    describe('isSearchListVisible', () => {
      it('should toggle props which control visibility of Searched Items list from state passed', () => {
        vm1.$store.dispatch(`${vm1Namespace}/receiveSearchedItemsSuccess`, [mockRawProject]);

        expect(vm1.state.isLoadingItems).toBeFalsy();
        expect(vm1.state.isItemsListVisible).toBeFalsy();
        expect(vm1.state.isSearchListVisible).toBeTruthy();

        vm1.$store.dispatch(`${vm1Namespace}/setSearchQuery`, '');
        expect(vm1.state.isLoadingItems).toBeFalsy();
        expect(vm1.state.isItemsListVisible).toBeTruthy();
        expect(vm1.state.isSearchListVisible).toBeFalsy();
      });
    });

    describe('isLoadingItems', () => {
      it('should toggle props which control visibility of list loading animation from state passed', () => {
        vm1.$store.dispatch(`${vm1Namespace}/requestSearchedItems`);
        expect(vm1.state.isItemsListVisible).toBeFalsy();
        expect(vm1.state.isSearchListVisible).toBeFalsy();
        expect(vm1.state.isLoadingItems).toBeTruthy();

        vm1.$store.dispatch(`${vm1Namespace}/setSearchQuery`, '');
        expect(vm1.state.isItemsListVisible).toBeTruthy();
        expect(vm1.state.isSearchListVisible).toBeFalsy();
        expect(vm1.state.isLoadingItems).toBeFalsy();
      });
    });

    describe('fetchFrequentItems', () => {
      it('should set props for loading animation to `true` while frequent projects list is being loaded', () => {
        vm1.$store.dispatch(`${vm1Namespace}/requestFrequentItems`);

        expect(vm1.state.isLocalStorageFailed).toBeFalsy();
        expect(vm1.state.isLoadingItems).toBeTruthy();
      });

      it('should set props for loading animation to `false` and props for frequent projects list to `true` once data is loaded', () => {
        vm1.$store.dispatch(`${vm1Namespace}/receiveFrequentItemsSuccess`, [mockProject]);

        expect(vm1.state.isItemsListVisible).toBeTruthy();
        expect(vm1.state.isLoadingItems).toBeFalsy();
      });

      it('should set props for loading animation to `false` and props for frequent groups list to `true` once data is loaded', () => {
        vm2.$store.dispatch(`${vm2Namespace}/receiveFrequentItemsSuccess`, [mockGroup]);

        expect(vm2.state.isItemsListVisible).toBeTruthy();
        expect(vm2.state.isLoadingItems).toBeFalsy();
      });

      it('should set props for failure message to `true` when method fails to fetch frequent projects list', () => {
        expect(vm1.state.isLocalStorageFailed).toBeFalsy();

        vm1.$store.dispatch(`${vm1Namespace}/receiveFrequentItemsError`);
        expect(vm1.state.isLocalStorageFailed).toBeTruthy();
      });

      it('should set props for search results list to `true` if search query was already made previously', () => {
        spyOn(bp, 'getBreakpointSize').and.returnValue('md');

        vm1.$store.dispatch(`${vm1Namespace}/setSearchQuery`, 'test');
        vm1.$store.dispatch(`${vm1Namespace}/receiveSearchedItemsSuccess`, [mockRawProject]);
        vm1.dropdownOpenHandler();

        expect(vm1.state.isSearchListVisible).toBeTruthy();
        expect(vm1.state.isItemsListVisible).toBeFalsy();
      });

      it('should set props for frequent projects list to `true` if search query was already made but screen size is less than 768px', () => {
        spyOn(bp, 'getBreakpointSize').and.returnValue('sm');

        vm1.$store.dispatch(`${vm1Namespace}/setSearchQuery`, 'test');
        vm1.$store.dispatch(`${vm1Namespace}/receiveSearchedItemsSuccess`, [mockRawProject]);
        vm1.dropdownOpenHandler();

        expect(vm1.state.isSearchListVisible).toBeFalsy();
        expect(vm1.state.isItemsListVisible).toBeTruthy();
      });
    });

    describe('fetchSearchedItems', () => {
      const searchQuery = 'test';

      it('should perform project search with provided search query', done => {
        const mockData = [mockRawProject];
        spyOn(vm1, 'toggleLoader');
        spyOn(vm1, 'toggleSearchItemsList');
        spyOn(vm1.service, 'getSearchedItems').and.returnValue(returnServicePromise(mockData));
        spyOn(vm1, 'setSearchedItems');

        vm1.fetchSearchedItems(searchQuery);
        setTimeout(() => {
          expect(vm1.searchQuery).toBe(searchQuery);
          expect(vm1.toggleLoader).toHaveBeenCalledWith(true);
          expect(vm1.service.getSearchedItems).toHaveBeenCalledWith(searchQuery);
          expect(vm1.toggleSearchItemsList).toHaveBeenCalledWith(true);
          expect(vm1.setSearchedItems).toHaveBeenCalledWith(mockData);
          done();
        }, 0);
      });

      it('should perform group search with provided search query', done => {
        const mockData = [mockRawGroup];
        spyOn(vm2, 'toggleLoader');
        spyOn(vm2, 'toggleSearchItemsList');
        spyOn(vm2.service, 'getSearchedItems').and.returnValue(returnServicePromise(mockData));
        spyOn(vm2, 'setSearchedItems');

        vm2.fetchSearchedItems(searchQuery);
        setTimeout(() => {
          expect(vm2.searchQuery).toBe(searchQuery);
          expect(vm2.toggleLoader).toHaveBeenCalledWith(true);
          expect(vm2.service.getSearchedItems).toHaveBeenCalledWith(searchQuery);
          expect(vm2.toggleSearchItemsList).toHaveBeenCalledWith(true);
          expect(vm2.setSearchedItems).toHaveBeenCalledWith(mockData);
          done();
        }, 0);
      });

      it('should update props for showing search failure', done => {
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
      it('should log current project access via service', done => {
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
        spyOn(vm1, 'clearSearchedItems');
        spyOn(vm1, 'toggleFrequentItemsList');

        vm1.handleSearchClear();

        expect(vm1.toggleFrequentItemsList).toHaveBeenCalledWith(true);
        expect(vm1.clearSearchedItems).toHaveBeenCalled();
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
    it('should bind event listeners on eventHub', done => {
      const namespace = 'projects';
      spyOn(eventHub, '$on');

      createComponentWithStore(namespace).$mount();

      Vue.nextTick(() => {
        expect(eventHub.$on).toHaveBeenCalledWith(
          `${namespace}-dropdownOpen`,
          jasmine.any(Function),
        );
        done();
      });
    });
  });

  describe('beforeDestroy', () => {
    it('should unbind event listeners on eventHub', done => {
      const namespace = 'projects';
      const vm = createComponentWithStore(namespace);
      spyOn(eventHub, '$off');

      vm.$mount();
      vm.$destroy();

      Vue.nextTick(() => {
        expect(eventHub.$off).toHaveBeenCalledWith(
          `${namespace}-dropdownOpen`,
          jasmine.any(Function),
        );
        done();
      });
    });
  });

  describe('template', () => {
    const namespace = 'projects';
    let vm;

    beforeEach(() => {
      vm = createComponentWithStore(namespace);
    });

    afterEach(() => {
      vm.$destroy();
    });

    it('should render search input', () => {
      expect(vm.$el.querySelector('.search-input-container')).toBeDefined();
    });

    it('should render loading animation', done => {
      vm.$store.dispatch(`${namespace}/requestSearchedItems`);

      Vue.nextTick(() => {
        const loadingEl = vm.$el.querySelector('.loading-animation');

        expect(loadingEl).toBeDefined();
        expect(loadingEl.classList.contains('prepend-top-20')).toBeTruthy();
        expect(loadingEl.querySelector('i').getAttribute('aria-label')).toBe('Loading projects');
        done();
      });
    });

    it('should render frequent projects list header', done => {
      Vue.nextTick(() => {
        const sectionHeaderEl = vm.$el.querySelector('.section-header');

        expect(sectionHeaderEl).toBeDefined();
        expect(sectionHeaderEl.innerText.trim()).toBe('Frequently visited');
        done();
      });
    });

    it('should render frequent projects list', done => {
      Vue.nextTick(() => {
        expect(vm.$el.querySelector('.frequent-items-list-container')).toBeDefined();
        done();
      });
    });

    it('should render searched projects list', done => {
      vm.$store.dispatch(`${namespace}/receiveSearchedItemsSuccess`, [mockRawProject]);

      Vue.nextTick(() => {
        expect(vm.$el.querySelector('.section-header')).toBe(null);
        expect(vm.$el.querySelector('.frequent-items-search-container')).toBeDefined();
        done();
      });
    });
  });
});
