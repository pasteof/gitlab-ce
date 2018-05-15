import Vue from 'vue';

import frequentItemsListComponent from '~/frequent_items/components/frequent_items_list.vue';

import mountComponent from 'spec/helpers/vue_mount_component_helper';
import { mockFrequentGroups, mockFrequentProjects } from '../mock_data';

const createComponent = namespace => {
  const Component = Vue.extend(frequentItemsListComponent);

  return mountComponent(Component, {
    namespace,
    items: mockFrequentProjects,
    localStorageFailed: false,
  });
};

describe('FrequentItemsListComponent', () => {
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
      it('should return `true` or `false` representing whether if `items` is empty or not with projects', () => {
        vm1.items = [];
        expect(vm1.isListEmpty).toBeTruthy();

        vm1.items = mockFrequentProjects;
        expect(vm1.isListEmpty).toBeFalsy();
      });

      it('should return `true` or `false` representing whether if `items` is empty or not with groups', () => {
        vm2.items = [];
        expect(vm2.isListEmpty).toBeTruthy();

        vm2.items = mockFrequentGroups;
        expect(vm2.isListEmpty).toBeFalsy();
      });
    });

    describe('listEmptyMessage', () => {
      it('should return appropriate empty list message based on value of `localStorageFailed` prop with projects', () => {
        vm1.localStorageFailed = true;
        expect(vm1.listEmptyMessage).toBe('This feature requires browser localStorage support');

        vm1.localStorageFailed = false;
        expect(vm1.listEmptyMessage).toBe('Projects you visit often will appear here');
      });

      it('should return appropriate empty list message based on value of `localStorageFailed` prop with groups', () => {
        vm2.localStorageFailed = true;
        expect(vm2.listEmptyMessage).toBe('This feature requires browser localStorage support');

        vm2.localStorageFailed = false;
        expect(vm2.listEmptyMessage).toBe('Groups you visit often will appear here');
      });
    });
  });

  describe('template', () => {
    it('should render component element with list of projects', done => {
      vm1.items = mockFrequentProjects;

      Vue.nextTick(() => {
        expect(vm1.$el.classList.contains('frequent-items-list-container')).toBeTruthy();
        expect(vm1.$el.querySelectorAll('ul.list-unstyled').length).toBe(1);
        expect(vm1.$el.querySelectorAll('li.frequent-items-list-item-container').length).toBe(5);
        done();
      });
    });

    it('should render component element with list of groups', done => {
      vm2.items = mockFrequentGroups;

      Vue.nextTick(() => {
        expect(vm2.$el.classList.contains('frequent-items-list-container')).toBeTruthy();
        expect(vm2.$el.querySelectorAll('ul.list-unstyled').length).toBe(1);
        expect(vm2.$el.querySelectorAll('li.frequent-items-list-item-container').length).toBe(2);
        done();
      });
    });

    it('should render component element with empty message', done => {
      vm1.items = [];

      Vue.nextTick(() => {
        expect(vm1.$el.querySelectorAll('li.section-empty').length).toBe(1);
        expect(vm1.$el.querySelectorAll('li.frequent-items-list-item-container').length).toBe(0);
        done();
      });
    });
  });
});
