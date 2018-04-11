export default class FrequentItemsStore {
  constructor() {
    this.state = {};
    this.state.frequentItems = [];
    this.state.searchedItems = [];
  }

  setFrequentItems(rawItems) {
    this.state.frequentItems = rawItems;
  }

  getFrequentItems() {
    return this.state.frequentItems;
  }

  setSearchedItems(rawItems) {
    this.state.searchedItems = rawItems.map(rawItem => ({
      id: rawItem.id,
      name: rawItem.name,
      namespace: rawItem.name_with_namespace || rawItem.full_name,
      webUrl: rawItem.web_url,
      avatarUrl: rawItem.avatar_url,
    }));
  }

  getSearchedItems() {
    return this.state.searchedItems;
  }

  clearSearchedItems() {
    this.state.searchedItems = [];
  }
}
