import Vue from 'vue';

import FrequentItemsService from '~/frequent_items/services/frequent_items_service';
import searchComponent from '~/frequent_items/components/frequent_items_search_input.vue';
import eventHub from '~/frequent_items/event_hub';

import mountComponent from 'spec/helpers/vue_mount_component_helper';
import { currentSession } from '../mock_data';

const projectsNamespace = 'projects'; // can also use 'groups', but not useful to test both here
const session = currentSession[projectsNamespace];

const createComponent = () => {
  const Component = Vue.extend(searchComponent);
  const service = new FrequentItemsService(projectsNamespace, session.username);

  return mountComponent(Component, {
    service,
  });
};

describe('FrequentItemsSearchInputComponent', () => {
  describe('methods', () => {
    let vm;

    beforeEach(() => {
      vm = createComponent();
    });

    afterEach(() => {
      vm.$destroy();
    });

    describe('setFocus', () => {
      it('should set focus to search input', () => {
        spyOn(vm.$refs.search, 'focus');

        vm.setFocus();
        expect(vm.$refs.search.focus).toHaveBeenCalled();
      });
    });

    describe('emitSearchEvents', () => {
      it('should emit `searchItems` event via eventHub when `searchQuery` present', () => {
        const searchQuery = 'test';
        spyOn(eventHub, '$emit');
        vm.searchQuery = searchQuery;
        vm.emitSearchEvents();
        expect(eventHub.$emit).toHaveBeenCalledWith(`${projectsNamespace}-searchItems`, searchQuery);
      });

      it('should emit `searchCleared` event via eventHub when `searchQuery` is cleared', () => {
        spyOn(eventHub, '$emit');
        vm.searchQuery = '';
        vm.emitSearchEvents();
        expect(eventHub.$emit).toHaveBeenCalledWith(`${projectsNamespace}-searchCleared`);
      });
    });
  });

  describe('mounted', () => {
    it('should listen `dropdownOpen` event', (done) => {
      spyOn(eventHub, '$on');
      createComponent();

      Vue.nextTick(() => {
        expect(eventHub.$on).toHaveBeenCalledWith('dropdownOpen', jasmine.any(Function));
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
        expect(eventHub.$off).toHaveBeenCalledWith('dropdownOpen', jasmine.any(Function));
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

    it('should render component element', () => {
      const inputEl = vm.$el.querySelector('input.form-control');

      expect(vm.$el.classList.contains('search-input-container')).toBeTruthy();
      expect(vm.$el.classList.contains('hidden-xs')).toBeTruthy();
      expect(inputEl).not.toBe(null);
      expect(inputEl.getAttribute('placeholder')).toBe('Search your projects');
      expect(vm.$el.querySelector('.search-icon')).toBeDefined();
    });
  });
});
