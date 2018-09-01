function App () {
  const self = {
    vueInstance: null,
    data: {
      sites: [],
    },
  };

  function init () {
    self.vueInstance = new Vue({
      el: '#app',
      data: self.data,
    });
  }
  init();

  function getSiteMap () {
    return fetch('./sitemap.json')
      .then(res => res.json())
      .then(res => {
        console.debug('sitemap data', res);
        self.data.sites = res;
        return res;
      });
  }
  this.getSiteMap = getSiteMap;
}
