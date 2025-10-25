import { searchCities, type Coordinates } from './weather-api.js';

const search = document.querySelector("#search") as HTMLInputElement;
const results = document.querySelector('#results') as HTMLUListElement;

// Store current search results for keyboard navigation
let currentResults: Coordinates[] = [];

/**
 * Debounced a Function, meaning holding execution of that function until the delay is done.
 * @param func The function that should get debounced
 * @param delay The delay until the debounce occurs
 * @returns void
 */
function debounce(func: () => void, delay: number) {
    let timeoutId: number;

    return () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(func, delay);
    };
}

/**
 * Initializes the search by setting up the debounce function and adding event listeners
 * @returns void
 */
export function initSearch() {
  console.log("INITIALIZING SEARCH");

  if (!search || !results)
    return;

  let selectedIndex = -1;

  const debounced = debounce(async () => {
    const value = search.value.trim();

    if (value === '') {
      hideResults();
      return;
    }

    try {
      const matches = await searchCities(value);
      showResults(matches);
      selectedIndex = -1;
    } catch (error) {
      console.error('Error searching cities:', error);
      showResults([]); // Show no results on error
    }
  }, 300);

  search.addEventListener('input', () => {
    debounced();
  });

  // Add keyboard navigation support
  search.addEventListener('keydown', (e) => {
    const items = results.querySelectorAll('li[role="option"]');
    
    switch(e.key) {
      case 'ArrowDown':
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
        updateSelection(items, selectedIndex);
        break;
      case 'ArrowUp':
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, -1);
        updateSelection(items, selectedIndex);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < currentResults.length && items[selectedIndex]) {
          const selectedCity = currentResults[selectedIndex];
          if (selectedCity) {
            selectCity(selectedCity);
          }
        }
        break;
      case 'Escape':
        hideResults();
        selectedIndex = -1;
        break;
    }
  });

  // Hide results when clicking outside
  document.addEventListener('click', (e) => {
    if (!search.contains(e.target as Node) && !results.contains(e.target as Node)) {
      hideResults();
    }
  });

  console.log("SEARCH INITIALIZED");
}

/**
 * Updates the visual selection in the dropdown
 * @param items NodeList of option elements
 * @param selectedIndex Currently selected index
 */
function updateSelection(items: NodeListOf<Element>, selectedIndex: number) {
  items.forEach((item, index) => {
    if (index === selectedIndex) {
      item.setAttribute('aria-selected', 'true');
      search.setAttribute('aria-activedescendant', item.id);
    } else {
      item.setAttribute('aria-selected', 'false');
    }
  });
}

/**
 * Sets the current search text
 * @param text Text that gets set in the search
 * @param focus If the search bar should get focused
 * @returns void
 */
function setSearch(text: string, focus: boolean = false) {
    if (!search)
        return;

    search.value = text;
    if (focus)
        search.focus();
}

/**
 * Shows all matches as an interactive dropdown using an unordered list and list elements
 * @param matches All city matches
 * @returns void
 */
function showResults(matches: Coordinates[]) {
  results.innerHTML = '';
  currentResults = matches;

  if (matches.length === 0) {
    results.innerHTML = '<li role="option">Keine Treffer gefunden</li>';
    results.hidden = false;
    search.setAttribute('aria-expanded', 'true');
    return;
  }

  matches.forEach((city, index) => {
    const li = document.createElement('li');
    
    // Create main city text
    let cityText = city.name;
    if (city.country) {
      cityText += `, ${city.country}`;
    }
    
    // Add postal code if available
    if (city.postcodes && city.postcodes.length > 0) {
      cityText += ` (PLZ: ${city.postcodes[0]}`;
      if (city.postcodes.length > 1) {
        cityText += `, +${city.postcodes.length - 1} more`;
      }
      cityText += ')';
    }
    
    li.textContent = cityText;
    li.setAttribute('role', 'option');
    li.setAttribute('id', `result-${index}`);
    li.setAttribute('tabindex', '-1');
    li.setAttribute('data-city-index', index.toString());
    li.style.cursor = 'pointer';

    li.addEventListener('click', () => {
      selectCity(city);
    });

    // Add keyboard support
    li.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectCity(city);
      }
    });

    results.appendChild(li);
  });

  results.hidden = false;
  search.setAttribute('aria-expanded', 'true');
}

/**
 * Handles city selection from search results
 * @param city Selected city coordinates
 */
function selectCity(city: Coordinates) {
  let searchText = city.name;
  if (city.country) {
    searchText += `, ${city.country}`;
  }
  if (city.postcodes && city.postcodes.length > 0) {
    searchText += ` (PLZ: ${city.postcodes[0]})`;
  }
  
  // Clear the input and set the selected city as placeholder
  if (search) {
    search.value = '';
    search.placeholder = `Aktuell: ${searchText}`;
  }
  hideResults();
  
  // Trigger weather update with selected city
  const event = new CustomEvent('citySelected', { 
    detail: city 
  });
  document.dispatchEvent(event);
}

/**
 * Hides the search results dropdown
 * @returns void
 */
function hideResults() {
  results.innerHTML = '';
  results.hidden = true;
  search.setAttribute('aria-expanded', 'false');
}