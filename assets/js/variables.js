// global variables;
const doc = document.documentElement;
const toggleId = 'toggle';
const showId = 'show';
const menu = 'menu';

// defined in config.toml
const rootURL = '{{ absURL "" }}';
const langRootURL = '{{ .Site.LanguagePrefix }}';
const lang = '{{ .Site.Language }}';

// defined in i18n / translation files
// TODO: fix i18n search. Hacked solution.
// Hugo seems to hardcode this info at build time and does not detect the correct locale
// Hack: use the document.path to see if it's italian otherwise fallback to english
// only en.toml file is used. Discarding and coding translations below
// OLD code not working
// const quickLinks = '{{ T "quick_links" }}';
// const searchResultsLabel = '{{ T "search_results_label" }}';
// const shortSearchQuery = '{{ T "short_search_query" }}'
// const typeToSearch = '{{ T "type_to_search" }}';
// const noMatchesFound = '{{ T "no_matches" }}';

const marsI18n = {
  en: {
    docs_menu: "Docs Menu",
    noMatchesFound: "No matches found",
    quickLinks: "Quick links",
    search_field_placeholder: "Search the docs",
    searchResultsLabel: "Search Results",
    shortSearchQuery: "Query is too short",
    site_menu: "Site Menu",
    typeToSearch: "Type in the text field above to search ⬆️",
  },
  it: {
    docs_menu: "Menu",
    noMatchesFound: "Nessun risultato",
    quickLinks: "Link rapidi",
    search_field_placeholder: "Cerca...",
    searchResultsLabel: "Risultati della ricerca",
    shortSearchQuery: "La chiave di ricerca è troppo corta",
    site_menu: "Menu del sito",
    typeToSearch: "Scrivi nel campo di testo qui sopra ⬆️ per cercare",
  }
}