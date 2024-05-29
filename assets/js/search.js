function initializeSearch(index) {
  const lang = document.location.pathname.indexOf('/it/') != -1 ? 'it' : 'en';

  const searchKeys = ['title', 'link', 'body', 'id'];
  
  const searchPageElement = elem('#searchpage');
  
  const searchOptions = {
    ignoreLocation: true,
    findAllMatches: true,
    includeScore: true,
    shouldSort: true,
    keys: searchKeys,
    threshold: 0.0
  };
  
  index = new Fuse(index, searchOptions);
  
  function minQueryLen(query) {
    query = query.trim();
    const queryIsFloat = parseFloat(query);
    const minimumQueryLength = queryIsFloat ? 1 : 2;
    return minimumQueryLength;
  }
  
  function searchResults(results=[], query="", passive = false) {
    let resultsFragment = new DocumentFragment();
    let showResults = elem('.search_results');
    if(passive) {
      showResults = searchPageElement;
    }
    emptyEl(showResults);
  
    const queryLen = query.length;
    const requiredQueryLen = minQueryLen(query);
  
    if(results.length && queryLen >= requiredQueryLen) {
      let resultsTitle = createEl('h3');
      resultsTitle.className = 'search_title';
      resultsTitle.innerText = marsI18n[lang].quickLinks;
      if(passive) {
        resultsTitle.innerText = marsI18n[lang].searchResultsLabel;
      }
      resultsFragment.appendChild(resultsTitle);
      if(!searchPageElement) {
        results = results.slice(0,8);
      } else {
        results = results.slice(0,12);
      }
      results.forEach(function(result){
        let item = createEl('a');
        item.href = `${result.link}?query=${query}`;
        item.className = 'search_result';
        item.style.order = result.score;
        if(passive) {
          pushClass(item, 'passive');
          let itemTitle = createEl('h3');
          itemTitle.textContent = result.title;
          item.appendChild(itemTitle);
  
          let itemDescription = createEl('p');
          // position of first search term instance
          let queryInstance = result.body.indexOf(query);
          itemDescription.textContent = `... ${result.body.substring(queryInstance, queryInstance + 200)} ...`;
          item.appendChild(itemDescription);
        } else {
          item.textContent = result.title;
        }
        resultsFragment.appendChild(item);
      });
    }
  
    if(queryLen >= requiredQueryLen) {
      if (!results.length) {
        showResults.innerHTML = `<span class="search_result">${marsI18n[lang].noMatchesFound}</span>`;
      }
    } else {
      if (queryLen > 1) {
        showResults.innerHTML = `<label for="find" class="search_result">${marsI18n[lang].shortSearchQuery}</label>`;
      } else {
        showResults.innerHTML = `<label for="find" class="search_result">${marsI18n[lang].typeToSearch}</label>`;
      }
    }
  
    showResults.appendChild(resultsFragment);
  }
  
  function search(searchTerm, passive = false) {
    if(searchTerm.length) {
      let rawResults = index.search(searchTerm);
      rawResults = rawResults.map(function(result){
        const score = result.score;
        const resultItem = result.item;
        resultItem.score = (parseFloat(score) * 50).toFixed(0);
        return resultItem;
      });
  
      passive ? searchResults(rawResults, searchTerm, true) : searchResults(rawResults, searchTerm);
  
    } else {
      passive ? searchResults([], "", true) : searchResults();
    }
  }
  
  function liveSearch() {
    const searchField = elem('.search_field');
  
    if (searchField) {
      searchField.addEventListener('input', function() {
        const searchTerm = searchField.value.trim().toLowerCase();
        search(searchTerm);
      });
  
      if(!searchPageElement) {
        searchField.addEventListener('change', function(){
          const searchTerm = searchField.value.trim().toLowerCase();
          if(searchTerm.length)  {
            // TODO: fixme hardcoded url
            const searchUrl = lang === 'it' ? 'it/cerca' : 'search'
            window.location.href = new URL(`${searchUrl}/?query=${searchTerm}`, rootURL).href;
          }
        });
      }
    }
  }
  
  function findQuery(query = 'query') {
    const urlParams = new URLSearchParams(window.location.search);
    if(urlParams.has(query)){
      let c = urlParams.get(query);
      return c;
    }
    return "";
  }
  
  function passiveSearch() {
    if(searchPageElement) {
      const searchTerm = findQuery();
      search(searchTerm, true);
  
      // search actively after search page has loaded
      const searchField = elem('.search_field');
  
      if(searchField) {
        searchField.addEventListener('input', function() {
          const searchTerm = searchField.value.trim().toLowerCase();
          search(searchTerm, true);
          wrapText(searchTerm, main);
        });
      }
    }
  }
  
  function hasSearchResults() {
    const searchResults = elem('.results');
    const body = searchResults.innerHTML.length;
    return [searchResults, body]
  }
  
  function clearSearchResults() {
    let searchResults = hasSearchResults();
    let actionable = searchResults[1];
    if(actionable) {
      searchResults = searchResults[0];
      searchResults.innerHTML = "";
      // clear search field
      const searchField = elem('.search_field');
      searchField.value = "";
    }
  }
  
  function onEscape(fn){
    window.addEventListener('keydown', function(event){
      if(event.code === "Escape") {
        fn();
      }
    });
  }
  
  let main = elem('main');
  if(!main) {
    main = elem('.main');
  }

  searchPageElement ? false : liveSearch();
  passiveSearch();

  wrapText(findQuery(), main);

  onEscape(clearSearchResults);
  
  window.addEventListener('click', function(event){
    const target = event.target;
    const isSearch = target.closest('.search') || target.matches('.search');
    if(!isSearch && !searchPageElement) {
      clearSearchResults();
    }
  });
}

window.addEventListener('load', function() { 
  // TODO: fix i18n search. Hacked solution.
  // Hugo seems to hardcode this info at build time and does not detect the correct locale
  // Hack: use the document.path to see if it's italian otherwise fallback to english
  langPrefix = ''
  if( document.location.pathname.indexOf('/it/') != -1 ) {
    langPrefix = 'it/'
  }
  fetch(`${rootURL}${langPrefix}index.json`)
  .then(response => response.json())
  .then(function(data) {
    data = data.length ? data : [];
    initializeSearch(data);
  })
  .catch((error) => console.error(error));
});
