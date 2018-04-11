import Vue from 'vue';
import VueResource from 'vue-resource';

import bp from '~/breakpoints';
import FrequentItemsService from '~/frequent_items/services/frequent_items_service';
import { FREQUENT_ITEMS } from '~/frequent_items/constants';
import { currentSession, unsortedFrequentProjects, sortedFrequentProjects } from '../mock_data';

Vue.use(VueResource);

const projectsNamespace = 'projects';
const session = currentSession[projectsNamespace];
FREQUENT_ITEMS.MAX_COUNT = 3;

describe('FrequentItemsService', () => {
  let service;

  beforeEach(() => {
    gon.api_version = session.apiVersion;
    gon.current_user_id = 1;
    service = new FrequentItemsService(projectsNamespace, session.username);
  });

  describe('constructor', () => {
    it('should initialize default properties of class', () => {
      expect(service.isLocalStorageAvailable).toBeTruthy();
      expect(service.currentUserName).toBe(session.username);
      expect(service.storageKey).toBe(session.storageKey);
      expect(service.itemsPath).toBeDefined();
    });
  });

  describe('getSearchedItems', () => {
    it('should return promise from VueResource HTTP GET', () => {
      spyOn(service.itemsPath, 'get').and.stub();

      const searchQuery = 'lab';
      const queryParams = {
        simple: true,
        per_page: 20,
        membership: true,
        order_by: 'last_activity_at',
        search: searchQuery,
      };

      service.getSearchedItems(searchQuery);
      expect(service.itemsPath.get).toHaveBeenCalledWith(queryParams);
    });
  });

  describe('logItemAccess', () => {
    let storage;

    beforeEach(() => {
      storage = {};

      spyOn(window.localStorage, 'setItem').and.callFake((storageKey, value) => {
        storage[storageKey] = value;
      });

      spyOn(window.localStorage, 'getItem').and.callFake((storageKey) => {
        if (storage[storageKey]) {
          return storage[storageKey];
        }

        return null;
      });
    });

    it('should create a project store if it does not exist and adds a project', () => {
      service.logItemAccess(session.project);

      const projects = JSON.parse(storage[session.storageKey]);
      expect(projects.length).toBe(1);
      expect(projects[0].frequency).toBe(1);
      expect(projects[0].lastAccessedOn).toBeDefined();
    });

    it('should prevent inserting same report multiple times into store', () => {
      service.logItemAccess(session.project);
      service.logItemAccess(session.project);

      const projects = JSON.parse(storage[session.storageKey]);
      expect(projects.length).toBe(1);
    });

    it('should increase frequency of report if it was logged multiple times over the course of an hour', () => {
      let projects;
      spyOn(Math, 'abs').and.returnValue(3600001); // this will lead to `diff` > 1;
      service.logItemAccess(session.project);

      projects = JSON.parse(storage[session.storageKey]);
      expect(projects[0].frequency).toBe(1);

      service.logItemAccess(session.project);
      projects = JSON.parse(storage[session.storageKey]);
      expect(projects[0].frequency).toBe(2);
      expect(projects[0].lastAccessedOn).not.toBe(session.project.lastAccessedOn);
    });

    it('should always update project metadata', () => {
      let projects;
      const oldProject = {
        ...session.project,
      };

      const newProject = {
        ...session.project,
        name: 'New Name',
        avatarUrl: 'new/avatar.png',
        namespace: 'New / Namespace',
        webUrl: 'http://localhost/new/web/url',
      };

      service.logItemAccess(oldProject);
      projects = JSON.parse(storage[session.storageKey]);
      expect(projects[0].name).toBe(oldProject.name);
      expect(projects[0].avatarUrl).toBe(oldProject.avatarUrl);
      expect(projects[0].namespace).toBe(oldProject.namespace);
      expect(projects[0].webUrl).toBe(oldProject.webUrl);

      service.logItemAccess(newProject);
      projects = JSON.parse(storage[session.storageKey]);
      expect(projects[0].name).toBe(newProject.name);
      expect(projects[0].avatarUrl).toBe(newProject.avatarUrl);
      expect(projects[0].namespace).toBe(newProject.namespace);
      expect(projects[0].webUrl).toBe(newProject.webUrl);
    });

    it('should not add more than 20 projects in store', () => {
      for (let i = 1; i <= 5; i += 1) {
        const project = Object.assign(session.project, { id: i });
        service.logItemAccess(project);
      }

      const projects = JSON.parse(storage[session.storageKey]);
      expect(projects.length).toBe(3);
    });
  });

  describe('getTopFrequentItems', () => {
    let storage = {};

    beforeEach(() => {
      storage[session.storageKey] = JSON.stringify(unsortedFrequentProjects);

      spyOn(window.localStorage, 'getItem').and.callFake((storageKey) => {
        if (storage[storageKey]) {
          return storage[storageKey];
        }

        return null;
      });
    });

    it('should return top 5 frequently accessed projects for desktop screens', () => {
      spyOn(bp, 'getBreakpointSize').and.returnValue('md');
      const frequentItems = service.getTopFrequentItems();

      expect(frequentItems.length).toBe(5);
      frequentItems.forEach((project, index) => {
        expect(project.id).toBe(sortedFrequentProjects[index].id);
      });
    });

    it('should return top 3 frequently accessed projects for mobile screens', () => {
      spyOn(bp, 'getBreakpointSize').and.returnValue('sm');
      const frequentItems = service.getTopFrequentItems();

      expect(frequentItems.length).toBe(3);
      frequentItems.forEach((project, index) => {
        expect(project.id).toBe(sortedFrequentProjects[index].id);
      });
    });

    it('should return empty array if there are no projects available in store', () => {
      storage = {};
      expect(service.getTopFrequentItems().length).toBe(0);
    });
  });
});
