import Vue from 'vue';
import VueResource from 'vue-resource';

import bp from '~/breakpoints';
import FrequentItemsService from '~/frequent_items/services/frequent_items_service';
import { FREQUENT_ITEMS, HOUR_IN_MS } from '~/frequent_items/constants';
import { currentSession, unsortedFrequentItems, sortedFrequentItems } from '../mock_data';

Vue.use(VueResource);

FREQUENT_ITEMS.MAX_COUNT = 3;

describe('FrequentItemsService', () => {
  describe('Projects context', () => {
    let service;
    const projectsNamespace = 'projects';
    const session = currentSession[projectsNamespace];

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
        const newTimestamp = Date.now() + HOUR_IN_MS + 1;

        service.logItemAccess(session.project);
        projects = JSON.parse(storage[session.storageKey]);

        expect(projects[0].frequency).toBe(1);

        service.logItemAccess({
          ...session.project,
          lastAccessedOn: newTimestamp,
        });
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
        storage[session.storageKey] = JSON.stringify(unsortedFrequentItems);

        spyOn(window.localStorage, 'getItem').and.callFake((storageKey) => {
          if (storage[storageKey]) {
            return storage[storageKey];
          }

          return null;
        });
      });

      it('should return top 5 frequently accessed projects for desktop screens', () => {
        spyOn(bp, 'getBreakpointSize').and.returnValue('md');
        const frequentItems = service.getFrequentItems();

        expect(frequentItems.length).toBe(5);
        frequentItems.forEach((project, index) => {
          expect(project.id).toBe(sortedFrequentItems[index].id);
        });
      });

      it('should return top 3 frequently accessed projects for mobile screens', () => {
        spyOn(bp, 'getBreakpointSize').and.returnValue('sm');
        const frequentItems = service.getFrequentItems();

        expect(frequentItems.length).toBe(3);
        frequentItems.forEach((project, index) => {
          expect(project.id).toBe(sortedFrequentItems[index].id);
        });
      });

      it('should return empty array if there are no projects available in store', () => {
        storage = {};

        expect(service.getFrequentItems().length).toBe(0);
      });
    });
  });

  describe('Groups context', () => {
    let service;
    const groupsNamespace = 'groups';
    const session = currentSession[groupsNamespace];

    beforeEach(() => {
      gon.api_version = session.apiVersion;
      gon.current_user_id = 1;
      service = new FrequentItemsService(groupsNamespace, session.username);
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

      it('should create a group store if it does not exist and adds a group', () => {
        service.logItemAccess(session.group);

        const groups = JSON.parse(storage[session.storageKey]);

        expect(groups.length).toBe(1);
        expect(groups[0].frequency).toBe(1);
        expect(groups[0].lastAccessedOn).toBeDefined();
      });

      it('should prevent inserting same report multiple times into store', () => {
        service.logItemAccess(session.group);
        service.logItemAccess(session.group);

        const groups = JSON.parse(storage[session.storageKey]);

        expect(groups.length).toBe(1);
      });

      it('should increase frequency of report if it was logged multiple times over the course of an hour', () => {
        let groups;
        const newTimestamp = Date.now() + HOUR_IN_MS + 1;

        service.logItemAccess(session.group);
        groups = JSON.parse(storage[session.storageKey]);

        expect(groups[0].frequency).toBe(1);

        service.logItemAccess({
          ...session.group,
          lastAccessedOn: newTimestamp,
        });
        groups = JSON.parse(storage[session.storageKey]);

        expect(groups[0].frequency).toBe(2);
        expect(groups[0].lastAccessedOn).not.toBe(session.group.lastAccessedOn);
      });

      it('should always update group metadata', () => {
        let groups;
        const oldGroup = {
          ...session.group,
        };

        const newGroup = {
          ...session.group,
          name: 'New Group Name',
          avatarUrl: 'new/avatar.png',
          namespace: 'New / Group Name',
          webUrl: 'http://localhost/new',
        };

        service.logItemAccess(oldGroup);
        groups = JSON.parse(storage[session.storageKey]);

        expect(groups[0].name).toBe(oldGroup.name);
        expect(groups[0].avatarUrl).toBe(oldGroup.avatarUrl);
        expect(groups[0].namespace).toBe(oldGroup.namespace);
        expect(groups[0].webUrl).toBe(oldGroup.webUrl);

        service.logItemAccess(newGroup);
        groups = JSON.parse(storage[session.storageKey]);

        expect(groups[0].name).toBe(newGroup.name);
        expect(groups[0].avatarUrl).toBe(newGroup.avatarUrl);
        expect(groups[0].namespace).toBe(newGroup.namespace);
        expect(groups[0].webUrl).toBe(newGroup.webUrl);
      });

      it('should not add more than 20 groups in store', () => {
        for (let i = 1; i <= 5; i += 1) {
          const group = Object.assign(session.group, { id: i });
          service.logItemAccess(group);
        }

        const groups = JSON.parse(storage[session.storageKey]);

        expect(groups.length).toBe(3);
      });
    });

    describe('getTopFrequentItems', () => {
      let storage = {};

      beforeEach(() => {
        storage[session.storageKey] = JSON.stringify(unsortedFrequentItems);

        spyOn(window.localStorage, 'getItem').and.callFake((storageKey) => {
          if (storage[storageKey]) {
            return storage[storageKey];
          }

          return null;
        });
      });

      it('should return top 5 frequently accessed groups for desktop screens', () => {
        spyOn(bp, 'getBreakpointSize').and.returnValue('md');
        const frequentItems = service.getFrequentItems();

        expect(frequentItems.length).toBe(5);
        frequentItems.forEach((group, index) => {
          expect(group.id).toBe(sortedFrequentItems[index].id);
        });
      });

      it('should return top 3 frequently accessed groups for mobile screens', () => {
        spyOn(bp, 'getBreakpointSize').and.returnValue('sm');
        const frequentItems = service.getFrequentItems();

        expect(frequentItems.length).toBe(3);
        frequentItems.forEach((group, index) => {
          expect(group.id).toBe(sortedFrequentItems[index].id);
        });
      });

      it('should return empty array if there are no groups available in store', () => {
        storage = {};

        expect(service.getFrequentItems().length).toBe(0);
      });
    });
  });
});
