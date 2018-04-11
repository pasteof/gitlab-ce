import Vue from 'vue';

import frequentItemsListComponent from '~/frequent_items/components/frequent_items_list.vue';
import FrequentItemsService from '~/frequent_items/services/frequent_items_service';

import mountComponent from 'spec/helpers/vue_mount_component_helper';
import { currentSession, mockFrequentProjects } from '../mock_data';

const projectsNamespace = 'projects';
const session = currentSession[projectsNamespace];

const createComponent = () => {
  const Component = Vue.extend(frequentItemsListComponent);
  const service = new FrequentItemsService(projectsNamespace, session.username);

  return mountComponent(Component, {
    items: mockFrequentProjects,
    localStorageFailed: false,
    service,
  });
};

describe('FrequentItemsListComponent', () => {
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

        vm.items = mockFrequentProjects;
        expect(vm.isListEmpty).toBeFalsy();
      });
    });

    describe('listEmptyMessage', () => {
      it('should return appropriate empty list message based on value of `localStorageFailed` prop', () => {
        vm.localStorageFailed = true;
        expect(vm.listEmptyMessage).toBe('This feature requires browser localStorage support');

        vm.localStorageFailed = false;
        expect(vm.listEmptyMessage).toBe('Projects you visit often will appear here');
      });
    });
  });

  describe('template', () => {
    it('should render component element with list of items', (done) => {
      vm.items = mockFrequentProjects;

      Vue.nextTick(() => {
        expect(vm.$el.classList.contains('frequent-items-list-container')).toBeTruthy();
        expect(vm.$el.querySelectorAll('ul.list-unstyled').length).toBe(1);
        expect(vm.$el.querySelectorAll('li.frequent-items-list-item-container').length).toBe(5);
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
  });
});
