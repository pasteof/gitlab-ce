import Vue from 'vue';

import frequentItemsSearchListComponent from '~/frequent_items/components/frequent_items_search_list.vue';
import FrequentItemsService from '~/frequent_items/services/frequent_items_service';

import mountComponent from 'spec/helpers/vue_mount_component_helper';
import { currentSession, mockProject } from '../mock_data';

const projectsNamespace = 'projects';
const session = currentSession[projectsNamespace];

const createComponent = () => {
  const Component = Vue.extend(frequentItemsSearchListComponent);
  const service = new FrequentItemsService(projectsNamespace, session.username);

  return mountComponent(Component, {
    items: [mockProject],
    matcher: 'lab',
    searchFailed: false,
    service,
  });
};

describe('FrequentItemsSearchListComponent', () => {
  let vm;

  beforeEach(() => {
    vm = createComponent();
  });

  afterEach(() => {
    vm.$destroy();
  });

  describe('computed', () => {
    describe('isListEmpty', () => {
      it('should return `true` or `false` representing whether if `items` is empty of not', () => {
        vm.items = [];
        expect(vm.isListEmpty).toBeTruthy();

        vm.items = [mockProject];
        expect(vm.isListEmpty).toBeFalsy();
      });
    });

    describe('listEmptyMessage', () => {
      it('should return appropriate empty list message based on value of `searchFailed` prop', () => {
        vm.searchFailed = true;
        expect(vm.listEmptyMessage).toBe('Something went wrong on our end.');

        vm.searchFailed = false;
        expect(vm.listEmptyMessage).toBe('Sorry, no projects matched your search');
      });
    });
  });

  describe('template', () => {
    it('should render component element with list of items', (done) => {
      vm.items = [mockProject];

      Vue.nextTick(() => {
        expect(vm.$el.classList.contains('frequent-items-search-container')).toBeTruthy();
        expect(vm.$el.querySelectorAll('ul.list-unstyled').length).toBe(1);
        expect(vm.$el.querySelectorAll('li.frequent-items-list-item-container').length).toBe(1);
        done();
      });
    });

    it('should render component element with empty message', (done) => {
      vm.items = [];

      Vue.nextTick(() => {
        expect(vm.$el.querySelectorAll('li.section-empty').length).toBe(1);
        expect(vm.$el.querySelectorAll('li.frequent-items-list-item-container').length).toBe(0);
        done();
      });
    });

    it('should render component element with failure message', (done) => {
      vm.searchFailed = true;
      vm.items = [];

      Vue.nextTick(() => {
        expect(vm.$el.querySelectorAll('li.section-empty.section-failure').length).toBe(1);
        expect(vm.$el.querySelectorAll('li.frequent-items-list-item-container').length).toBe(0);
        done();
      });
    });
  });
});
