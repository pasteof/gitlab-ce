import { s__ } from '~/locale';

import { TRANSLATION_KEYS } from '../constants';

export default {
  props: {
    namespace: {
      type: String,
      required: true,
    },
  },
  methods: {
    getTranslations(keys) {
      const translationStrings = {};
      keys.forEach(key => {
        translationStrings[key] = s__(TRANSLATION_KEYS[this.namespace][key]);
      });

      return translationStrings;
    },
  },
};
