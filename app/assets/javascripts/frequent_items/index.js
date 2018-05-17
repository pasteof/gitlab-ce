import $ from 'jquery';
import Vue from 'vue';

import Translate from '~/vue_shared/translate';
import eventHub from '~/frequent_items/event_hub';

import FrequentProjects from './components/frequent_projects.vue';
import FrequentGroups from './components/frequent_groups.vue';

Vue.use(Translate);

const initFrequentProjectsDropdown = () => {
  const el = document.getElementById('js-projects-dropdown');
  const navEl = document.getElementById('nav-projects-dropdown');

  // Don't do anything if element doesn't exist (No groups dropdown)
  // This is for when the user accesses GitLab without logging in
  if (!el || !navEl) {
    return;
  }

  $(navEl).on('shown.bs.dropdown', () => {
    eventHub.$emit('projects-dropdownOpen');
  });

  // eslint-disable-next-line no-new
  new Vue({
    el,
    components: {
      FrequentProjects,
    },
    data() {
      const dataset = this.$options.el.dataset;
      const {
        projectId,
        projectName,
        projectNamespace,
        projectWebUrl,
        projectAvatarUrl,
        userName,
      } = dataset;
      const item = {
        id: Number(projectId),
        name: projectName,
        namespace: projectNamespace,
        webUrl: projectWebUrl,
        avatarUrl: projectAvatarUrl || null,
        lastAccessedOn: Date.now(),
      };

      return {
        currentUserName: userName,
        currentItem: item,
      };
    },
    render(createElement) {
      const { currentUserName, currentItem } = this;

      return createElement('frequent-projects', {
        props: {
          currentUserName,
          currentItem,
        },
      });
    },
  });
};

const initFrequentGroupsDropdown = () => {
  const el = document.getElementById('js-groups-dropdown');
  const navEl = document.getElementById('nav-groups-dropdown');

  // Don't do anything if element doesn't exist (No groups dropdown)
  // This is for when the user accesses GitLab without logging in
  if (!el || !navEl) {
    return;
  }

  $(navEl).on('shown.bs.dropdown', () => {
    eventHub.$emit('groups-dropdownOpen');
  });

  // eslint-disable-next-line no-new
  new Vue({
    el,
    components: {
      FrequentGroups,
    },
    data() {
      const dataset = this.$options.el.dataset;
      const { groupId, groupName, groupNamespace, groupWebUrl, groupAvatarUrl, userName } = dataset;
      const item = {
        id: Number(groupId),
        name: groupName,
        namespace: groupNamespace,
        webUrl: groupWebUrl,
        avatarUrl: groupAvatarUrl || null,
        lastAccessedOn: Date.now(),
      };

      return {
        currentUserName: userName,
        currentItem: item,
      };
    },
    render(createElement) {
      const { currentUserName, currentItem } = this;

      return createElement('frequent-groups', {
        props: {
          currentUserName,
          currentItem,
        },
      });
    },
  });
};

document.addEventListener('DOMContentLoaded', () => {
  initFrequentProjectsDropdown();
  initFrequentGroupsDropdown();
});
