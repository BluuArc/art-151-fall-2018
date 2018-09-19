(() => {
    function appendScript (url) {
      const scriptElem = document.createElement('script');
      scriptElem.src = url;
      return new Promise((resolve, reject) => {
        scriptElem.onerror = () => reject();
        scriptElem.onload = () => resolve();
        document.children[0].prepend(scriptElem);
      });
    }

    // meant to be used by one folder level down
    const mappings = {
      p5: ['https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.7.1/p5.min.js', '../processing-3.4/p5.min.js'],
      p5Dom: ['https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.7.1/addons/p5.dom.js', '../processing-3.4/p5-addons/p5.dom.js'],
    }

    function loadScript ([main, alt]) {
      console.debug('loading main', main);
      return appendScript(main).catch(() => {
        console.error('error occured loading main. loading alt', alt);
        return appendScript(alt);
      });
    }

    const p5Loader = {
      loadP5: () => loadScript(mappings.p5),
      loadP5Dom: () => loadScript(mappings.p5Dom),
    }
    
    window.p5Loader = p5Loader;
})();
