// TODO: Add tests for groups context
import Vue from 'vue';

import bp from '~/breakpoints';
import appComponent from '~/frequent_items/components/app.vue';
import eventHub from '~/frequent_items/event_hub';
import FrequentItemsService from '~/frequent_items/services/frequent_items_service';
import FrequentItemsStore from '~/frequent_items/stores/frequent_items_store';

import mountComponent from 'spec/helpers/vue_mount_component_helper';
import { currentSession, mockProject, mockRawProject } from '../mock_data';

const projectsNamespace = 'projects';
const session = currentSession[projectsNamespace];

const createComponent = () => {
  gon.api_version = session.apiVersion;
  const Component = Vue.extend(appComponent);
  const store = new FrequentItemsStore();
  const service = new FrequentItemsService(projectsNamespace, session.username);

  return mountComponent(Component, {
    namespace: projectsNamespace,
    store,
    service,
    currentUserName: session.username,
    currentItem: session.project,
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
    let vm;

    beforeEach(() => {
      vm = createComponent();
    });

    afterEach(() => {
      vm.$destroy();
    });

    describe('frequentItems', () => {
      it('should return list of frequently accessed projects from store', () => {
        expect(vm.frequentItems).toBeDefined();
        expect(vm.frequentItems.length).toBe(0);

        vm.store.setFrequentItems([mockProject]);
        expect(vm.frequentItems).toBeDefined();
        expect(vm.frequentItems.length).toBe(1);
      });
    });

    describe('searchItems', () => {
      it('should return list of frequently accessed projects from search endpoint', () => {
        expect(vm.searchItems).toBeDefined();
        expect(vm.searchItems.length).toBe(0);

        vm.store.setSearchedItems([mockRawProject]);
        expect(vm.searchItems).toBeDefined();
        expect(vm.searchItems.length).toBe(1);
      });
    });
  });

  describe('methods', () => {
    let vm;

    beforeEach(() => {
      vm = createComponent();
    });

    afterEach(() => {
      vm.$destroy();
    });

    describe('toggleFrequentItemsList', () => {
      it('should toggle props which control visibility of Frequent Items list from state passed', () => {
        vm.toggleFrequentItemsList(true);
        expect(vm.isLoadingItems).toBeFalsy();
        expect(vm.isSearchListVisible).toBeFalsy();
        expect(vm.isItemsListVisible).toBeTruthy();

        vm.toggleFrequentItemsList(false);
        expect(vm.isLoadingItems).toBeTruthy();
        expect(vm.isSearchListVisible).toBeTruthy();
        expect(vm.isItemsListVisible).toBeFalsy();
      });
    });

    describe('toggleSearchItemsList', () => {
      it('should toggle props which control visibility of Searched Items list from state passed', () => {
        vm.toggleSearchItemsList(true);
        expect(vm.isLoadingItems).toBeFalsy();
        expect(vm.isItemsListVisible).toBeFalsy();
        expect(vm.isSearchListVisible).toBeTruthy();

        vm.toggleSearchItemsList(false);
        expect(vm.isLoadingItems).toBeTruthy();
        expect(vm.isItemsListVisible).toBeTruthy();
        expect(vm.isSearchListVisible).toBeFalsy();
      });
    });

    describe('toggleLoader', () => {
      it('should toggle props which control visibility of list loading animation from state passed', () => {
        vm.toggleLoader(true);
        expect(vm.isItemsListVisible).toBeFalsy();
        expect(vm.isSearchListVisible).toBeFalsy();
        expect(vm.isLoadingItems).toBeTruthy();

        vm.toggleLoader(false);
        expect(vm.isItemsListVisible).toBeTruthy();
        expect(vm.isSearchListVisible).toBeTruthy();
        expect(vm.isLoadingItems).toBeFalsy();
      });
    });

    describe('fetchFrequentItems', () => {
      it('should set props for loading animation to `true` while frequent projects list is being loaded', () => {
        spyOn(vm, 'toggleLoader');

        vm.fetchFrequentItems();
        expect(vm.isLocalStorageFailed).toBeFalsy();
        expect(vm.toggleLoader).toHaveBeenCalledWith(true);
      });

      it('should set props for loading animation to `false` and props for frequent projects list to `true` once data is loaded', () => {
        const mockData = [mockProject];

        spyOn(vm.service, 'getFrequentItems').and.returnValue(mockData);
        spyOn(vm.store, 'setFrequentItems');
        spyOn(vm, 'toggleFrequentItemsList');

        vm.fetchFrequentItems();
        expect(vm.service.getFrequentItems).toHaveBeenCalled();
        expect(vm.store.setFrequentItems).toHaveBeenCalledWith(mockData);
        expect(vm.toggleFrequentItemsList).toHaveBeenCalledWith(true);
      });

      it('should set props for failure message to `true` when method fails to fetch frequent projects list', () => {
        spyOn(vm.service, 'getFrequentItems').and.returnValue(null);
        spyOn(vm.store, 'setFrequentItems');
        spyOn(vm, 'toggleFrequentItemsList');

        expect(vm.isLocalStorageFailed).toBeFalsy();

        vm.fetchFrequentItems();
        expect(vm.service.getFrequentItems).toHaveBeenCalled();
        expect(vm.store.setFrequentItems).toHaveBeenCalledWith([]);
        expect(vm.toggleFrequentItemsList).toHaveBeenCalledWith(true);
        expect(vm.isLocalStorageFailed).toBeTruthy();
      });

      it('should set props for search results list to `true` if search query was already made previously', () => {
        spyOn(bp, 'getBreakpointSize').and.returnValue('md');
        spyOn(vm.service, 'getFrequentItems');
        spyOn(vm, 'toggleSearchItemsList');

        vm.searchQuery = 'test';
        vm.fetchFrequentItems();
        expect(vm.service.getFrequentItems).not.toHaveBeenCalled();
        expect(vm.toggleSearchItemsList).toHaveBeenCalledWith(true);
      });

      it('should set props for frequent projects list to `true` if search query was already made but screen size is less than 768px', () => {
        spyOn(bp, 'getBreakpointSize').and.returnValue('sm');
        spyOn(vm, 'toggleSearchItemsList');
        spyOn(vm.service, 'getFrequentItems');

        vm.searchQuery = 'test';
        vm.fetchFrequentItems();
        expect(vm.service.getFrequentItems).toHaveBeenCalled();
        expect(vm.toggleSearchItemsList).not.toHaveBeenCalled();
      });
    });

    describe('fetchSearchedItems', () => {
      const searchQuery = 'test';

      it('should perform search with provided search query', (done) => {
        const mockData = [mockRawProject];
        spyOn(vm, 'toggleLoader');
        spyOn(vm, 'toggleSearchItemsList');
        spyOn(vm.service, 'getSearchedItems').and.returnValue(returnServicePromise(mockData));
        spyOn(vm.store, 'setSearchedItems');

        vm.fetchSearchedItems(searchQuery);
        setTimeout(() => {
          expect(vm.searchQuery).toBe(searchQuery);
          expect(vm.toggleLoader).toHaveBeenCalledWith(true);
          expect(vm.service.getSearchedItems).toHaveBeenCalledWith(searchQuery);
          expect(vm.toggleSearchItemsList).toHaveBeenCalledWith(true);
          expect(vm.store.setSearchedItems).toHaveBeenCalledWith(mockData);
          done();
        }, 0);
      });

      it('should update props for showing search failure', (done) => {
        spyOn(vm, 'toggleSearchItemsList');
        spyOn(vm.service, 'getSearchedItems').and.returnValue(returnServicePromise({}, true));

        vm.fetchSearchedItems(searchQuery);
        setTimeout(() => {
          expect(vm.searchQuery).toBe(searchQuery);
          expect(vm.service.getSearchedItems).toHaveBeenCalledWith(searchQuery);
          expect(vm.isSearchFailed).toBeTruthy();
          expect(vm.toggleSearchItemsList).toHaveBeenCalledWith(true);
          done();
        }, 0);
      });
    });

    describe('logCurrentItemAccess', () => {
      it('should log current project access via service', (done) => {
        spyOn(vm.service, 'logItemAccess');

        vm.currentItem = mockProject;
        vm.logCurrentItemAccess();

        setTimeout(() => {
          expect(vm.service.logItemAccess).toHaveBeenCalledWith(mockProject);
          done();
        }, 1);
      });
    });

    describe('handleSearchClear', () => {
      it('should show frequent projects list when search input is cleared', () => {
        spyOn(vm.store, 'clearSearchedItems');
        spyOn(vm, 'toggleFrequentItemsList');

        vm.handleSearchClear();

        expect(vm.toggleFrequentItemsList).toHaveBeenCalledWith(true);
        expect(vm.store.clearSearchedItems).toHaveBeenCalled();
        expect(vm.searchQuery).toBe('');
      });
    });

    describe('handleSearchFailure', () => {
      it('should show failure message within dropdown', () => {
        spyOn(vm, 'toggleSearchItemsList');

        vm.handleSearchFailure();
        expect(vm.toggleSearchItemsList).toHaveBeenCalledWith(true);
        expect(vm.isSearchFailed).toBeTruthy();
      });
    });
  });

  describe('created', () => {
    it('should bind event listeners on eventHub', (done) => {
      spyOn(eventHub, '$on');

      createComponent().$mount();

      Vue.nextTick(() => {
        expect(eventHub.$on).toHaveBeenCalledWith(`${projectsNamespace}-dropdownOpen`, jasmine.any(Function));
        expect(eventHub.$on).toHaveBeenCalledWith(`${projectsNamespace}-searchItems`, jasmine.any(Function));
        expect(eventHub.$on).toHaveBeenCalledWith(`${projectsNamespace}-searchCleared`, jasmine.any(Function));
        expect(eventHub.$on).toHaveBeenCalledWith(`${projectsNamespace}-searchFailed`, jasmine.any(Function));
        done();
      });
    });
  });

  describe('beforeDestroy', () => {
    it('should unbind event listeners on eventHub', (done) => {
      const vm = createComponent();
      spyOn(eventHub, '$off');

      vm.$mount();
      vm.$destroy();

      Vue.nextTick(() => {
        expect(eventHub.$off).toHaveBeenCalledWith(`${projectsNamespace}-dropdownOpen`, jasmine.any(Function));
        expect(eventHub.$off).toHaveBeenCalledWith(`${projectsNamespace}-searchItems`, jasmine.any(Function));
        expect(eventHub.$off).toHaveBeenCalledWith(`${projectsNamespace}-searchCleared`, jasmine.any(Function));
        expect(eventHub.$off).toHaveBeenCalledWith(`${projectsNamespace}-searchFailed`, jasmine.any(Function));
        done();
      });
    });
  });

  describe('template', () => {
    let vm;

    beforeEach(() => {
      vm = createComponent();
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
