import Vue from 'vue';

import frequentItemsSearchListComponent from '~/frequent_items/components/frequent_items_search_list.vue';
import FrequentItemsService from '~/frequent_items/services/frequent_items_service';

import mountComponent from 'spec/helpers/vue_mount_component_helper';
import { currentSession, mockGroup, mockProject } from '../mock_data';

const createComponent = context => {
  const Component = Vue.extend(frequentItemsSearchListComponent);
  const service = new FrequentItemsService(context, currentSession[context].username);

  return mountComponent(Component, {
    items: [mockProject],
    matcher: 'lab',
    searchFailed: false,
    service,
  });
};

describe('FrequentItemsSearchListComponent', () => {
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

  describe('computed', () => {
    describe('isListEmpty', () => {
      it('should return `true` or `false` representing whether if `items` is empty of not with projects', () => {
        vm1.items = [];
        expect(vm1.isListEmpty).toBeTruthy();

        vm1.items = [mockProject];
        expect(vm1.isListEmpty).toBeFalsy();
      });

      it('should return `true` or `false` representing whether if `items` is empty of not with groups', () => {
        vm2.items = [];
        expect(vm2.isListEmpty).toBeTruthy();

        vm2.items = [mockGroup];
        expect(vm2.isListEmpty).toBeFalsy();
      });
    });

    describe('listEmptyMessage', () => {
      it('should return appropriate empty list message based on value of `searchFailed` prop with projects', () => {
        vm1.searchFailed = true;
        expect(vm1.listEmptyMessage).toBe('Something went wrong on our end.');

        vm1.searchFailed = false;
        expect(vm1.listEmptyMessage).toBe('Sorry, no projects matched your search');
      });

      it('should return appropriate empty list message based on value of `searchFailed` prop with groups', () => {
        vm2.searchFailed = true;
        expect(vm2.listEmptyMessage).toBe('Something went wrong on our end.');

        vm2.searchFailed = false;
        expect(vm2.listEmptyMessage).toBe('Sorry, no groups matched your search');
      });
    });
  });

  describe('template', () => {
    it('should render component element with list of projects', (done) => {
      vm1.items = [mockProject];

      Vue.nextTick(() => {
        expect(vm1.$el.classList.contains('frequent-items-search-container')).toBeTruthy();
        expect(vm1.$el.querySelectorAll('ul.list-unstyled').length).toBe(1);
        expect(vm1.$el.querySelectorAll('li.frequent-items-list-item-container').length).toBe(1);
        done();
      });
    });

    it('should render component element with list of groups', (done) => {
      vm2.items = [mockGroup];

      Vue.nextTick(() => {
        expect(vm2.$el.classList.contains('frequent-items-search-container')).toBeTruthy();
        expect(vm2.$el.querySelectorAll('ul.list-unstyled').length).toBe(1);
        expect(vm2.$el.querySelectorAll('li.frequent-items-list-item-container').length).toBe(1);
        done();
      });
    });

    it('should render component element with empty message', (done) => {
      vm1.items = [];

      Vue.nextTick(() => {
        expect(vm1.$el.querySelectorAll('li.section-empty').length).toBe(1);
        expect(vm1.$el.querySelectorAll('li.frequent-items-list-item-container').length).toBe(0);
        done();
      });
    });

    it('should render component element with failure message', (done) => {
      vm1.searchFailed = true;
      vm1.items = [];

      Vue.nextTick(() => {
        expect(vm1.$el.querySelectorAll('li.section-empty.section-failure').length).toBe(1);
        expect(vm1.$el.querySelectorAll('li.frequent-items-list-item-container').length).toBe(0);
        done();
      });
    });
  });
});
