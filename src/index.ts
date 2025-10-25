import { initSearch } from "./search.js";
import { getCurrentWeather, getBerlinCoordinates, getWeatherInfo, type WeatherData, type Coordinates } from "./weather-api.js";
import { saveLastCity, getLastCity, isStorageAvailable, clearLastCity } from "./storage.js";

const button = document.querySelector("#submit-search") as HTMLButtonElement;
const search = document.querySelector('#search') as HTMLInputElement;
const temperatureDisplay = document.querySelector("#temperature");
const feelsLikeDisplay = document.querySelector("#feels-like");
const weatherTypeDisplay = document.querySelector("#weather-type");
const cityDisplay = document.querySelector("#city");
const weatherImage = document.querySelector("#weather-image") as HTMLImageElement;
const postalCodesDisplay = document.querySelector("#postal-codes") as HTMLElement;
const weatherDataSection = document.querySelector("#weather-data") as HTMLElement;
const weatherLoadingSection = document.querySelector("#weather-loading") as HTMLElement;

// Add humidity and wind speed displays
let humidityDisplay = document.querySelector("#humidity");
let windSpeedDisplay = document.querySelector("#wind-speed");

/**
 * Initializes the page state based on whether there's a saved city
 */
function initializePageState() {
    const lastCity = getLastCity();
    
    if (lastCity) {
        // There's a saved city - show loading state
        if (weatherLoadingSection) {
            weatherLoadingSection.hidden = false;
        }
        if (weatherDataSection) {
            weatherDataSection.hidden = true;
        }
    } else {
        // No saved city - prepare for immediate Berlin display
        if (weatherLoadingSection) {
            weatherLoadingSection.hidden = true;
        }
        if (weatherDataSection) {
            weatherDataSection.hidden = false;
        }
    }
}

// Initialize search functionality and load initial weather
initSearch();

// Initialize page state and load weather on page load
document.addEventListener('DOMContentLoaded', () => {
    initializePageState();
    loadInitialWeather();
});

/**
 * Shows the loading state and hides weather data
 */
function showLoadingState() {
    if (weatherLoadingSection) {
        weatherLoadingSection.hidden = false;
    }
    if (weatherDataSection) {
        weatherDataSection.hidden = true;
    }
}

/**
 * Hides loading state and shows weather data with animation
 */
function showWeatherData() {
    if (weatherLoadingSection) {
        weatherLoadingSection.hidden = true;
    }
    if (weatherDataSection) {
        weatherDataSection.hidden = false;
        weatherDataSection.classList.add('fade-in');
        
        // Remove animation class after animation completes
        setTimeout(() => {
            weatherDataSection.classList.remove('fade-in');
        }, 500);
    }
}

/**
 * Updates the weather display with new weather data
 * @param weatherData Complete weather information
 */
function updateWeatherDisplay(weatherData: WeatherData) {
    const { temperature, feelsLike, weatherDescription, cityName, country, weatherCode, humidity, windSpeed, postcodes } = weatherData;
    
    // Update text content with proper formatting
    if (temperatureDisplay)
        temperatureDisplay.textContent = `${temperature}°C`;

    if (feelsLikeDisplay)
        feelsLikeDisplay.textContent = `${feelsLike}°C`;

    if (weatherTypeDisplay)
        weatherTypeDisplay.textContent = weatherDescription;

    if (cityDisplay) {
        const fullCityName = country ? `${cityName}, ${country}` : cityName;
        cityDisplay.textContent = fullCityName;
    }

    // Update postal codes display
    if (postalCodesDisplay) {
        if (postcodes && postcodes.length > 0) {
            let postalText = `PLZ: ${postcodes[0]}`;
            if (postcodes.length > 1) {
                postalText += `, ${postcodes.slice(1, 3).join(', ')}`;
                if (postcodes.length > 3) {
                    postalText += `, +${postcodes.length - 3} more`;
                }
            }
            postalCodesDisplay.textContent = postalText;
            postalCodesDisplay.style.display = 'block';
        } else {
            postalCodesDisplay.style.display = 'none';
        }
    }

    // Update additional weather information
    if (humidityDisplay)
        humidityDisplay.textContent = `${humidity}%`;

    if (windSpeedDisplay)
        windSpeedDisplay.textContent = `${windSpeed} km/h`;

    // Update weather image with proper paths and alt text
    if (weatherImage) {
        const weatherInfo = getWeatherInfo(weatherCode);
        const imagePath = `./assets/images/${weatherInfo.image}`;
        weatherImage.src = imagePath;
        weatherImage.alt = `${weatherDescription} weather conditions in ${cityName}`;
        
        // Add error handling for missing images
        weatherImage.onerror = () => {
            weatherImage.src = './assets/images/sunny.png'; // fallback image
            weatherImage.alt = `Weather conditions in ${cityName}`;
        };
    }

    // Show the weather data with animation first
    showWeatherData();
    
    // Update background theme after a slight delay to avoid flash
    setTimeout(() => {
        const weatherInfo = getWeatherInfo(weatherCode);
        updateBackgroundTheme(weatherInfo.background);
    }, 100);
}

/**
 * Updates the background theme based on weather background type
 * @param backgroundType The background type (sunny/cloudy)
 */
function updateBackgroundTheme(backgroundType: string) {
    const body = document.body;
    
    // Add background loaded class for smoother transitions
    body.classList.add('background-loaded');
    
    // Remove existing weather classes
    body.classList.remove("sunny", "cloudy");
    
    // Add appropriate weather class with slight delay for smooth transition
    requestAnimationFrame(() => {
        body.classList.add(backgroundType);
    });
}

/**
 * Fetches and displays weather data for the given coordinates
 * @param coordinates City coordinates to fetch weather for
 * @param saveToStorage Whether to save this city as the last selected
 * @param showLoading Whether to show the loading spinner (false for initial load)
 */
async function fetchWeatherData(coordinates: Coordinates, saveToStorage: boolean = true, showLoading: boolean = true) {
    try {
        // Show loading states
        if (showLoading) {
            showLoadingState();
        }
        
        if (button) {
            button.disabled = true;
            button.innerHTML = '<span class="button-text">Lädt...</span>';
        }

        // Fetch real weather data
        const weatherData = await getCurrentWeather(coordinates);
        
        // Update the display (this will also show the weather data)
        updateWeatherDisplay(weatherData);

        // Save to localStorage if requested and available
        if (saveToStorage && isStorageAvailable()) {
            try {
                const searchText = generateSearchText(coordinates);
                saveLastCity(coordinates, searchText);
            } catch (error) {
                console.warn('Failed to save city to storage:', error);
                // Don't let storage errors affect the weather display
            }
        }

        // Announce the update to screen readers
        announceWeatherUpdate(weatherData.cityName, weatherData.temperature, weatherData.weatherDescription);

    } catch (error) {
        console.error('Error fetching weather:', error);
        
        // Show error in weather section
        showWeatherData(); // Show the weather section first
        
        if (cityDisplay) {
            cityDisplay.textContent = 'Fehler beim Laden der Wetterdaten';
        }
        if (weatherTypeDisplay) {
            weatherTypeDisplay.textContent = 'Bitte versuchen Sie es erneut';
        }
    } finally {
        // Reset button state
        if (button) {
            button.disabled = false;
            button.innerHTML = '<span class="button-text">Wetter abrufen</span>';
        }
    }
}

/**
 * Generates search text for a given city coordinates
 * @param coordinates City coordinates
 * @returns Formatted search text
 */
function generateSearchText(coordinates: Coordinates): string {
    let searchText = coordinates.name;
    if (coordinates.country) {
        searchText += `, ${coordinates.country}`;
    }
    if (coordinates.postcodes && coordinates.postcodes.length > 0) {
        searchText += ` (PLZ: ${coordinates.postcodes[0]})`;
    }
    return searchText;
}

/**
 * Announces weather updates to screen readers
 * @param cityName Name of the city
 * @param temp Temperature
 * @param weatherType Weather condition
 */
function announceWeatherUpdate(cityName: string, temp: number, weatherType: string) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = `Wetter aktualisiert für ${cityName}. Aktuelle Bedingungen: ${weatherType}, ${temp} Grad Celsius.`;
    
    document.body.appendChild(announcement);
    
    // Remove the announcement after it's been read
    setTimeout(() => {
        if (announcement.parentNode) {
            announcement.parentNode.removeChild(announcement);
        }
    }, 1000);
}

/**
 * Loads weather data on page load - either last saved city or Berlin default
 */
async function loadInitialWeather() {
    const loadingIndicator = document.querySelector('#loading-indicator') as HTMLElement;
    
    try {
        // Try to get the last saved city
        const lastCity = getLastCity();
        
        if (lastCity) {
            console.log('Loading last saved city:', lastCity.name);
            
            // Show loading indicator for saved city
            if (loadingIndicator) {
                loadingIndicator.hidden = false;
            }
            
            // Keep loading section visible and load saved city
            await fetchWeatherData(lastCity, false, false);
            
            // Set the search field placeholder to the saved city
            if (search) {
                search.placeholder = `Aktuell: ${lastCity.searchText}`;
                search.value = '';
            }
            
            // Set current coordinates for the button
            currentCoordinates = lastCity;
        } else {
            // Fall back to Berlin default - show immediately without loading
            console.log('No saved city found, loading Berlin default immediately');
            
            // Hide loading section and show Berlin data immediately
            if (weatherLoadingSection) {
                weatherLoadingSection.hidden = true;
            }
            
            const berlinCoords = getBerlinCoordinates();
            await fetchWeatherData(berlinCoords, false, false); // Don't save Berlin or show loading
            
            // Set Berlin as placeholder in search field
            if (search) {
                search.placeholder = `Aktuell: ${generateSearchText(berlinCoords)}`;
                search.value = '';
            }
            
            currentCoordinates = berlinCoords;
        }
    } catch (error) {
        console.error('Error loading initial weather:', error);
        
        // Ultimate fallback to Berlin - hide loading section first
        if (weatherLoadingSection) {
            weatherLoadingSection.hidden = true;
        }
        
        const berlinCoords = getBerlinCoordinates();
        await fetchWeatherData(berlinCoords, false, false);
        if (search) {
            search.placeholder = `Aktuell: ${generateSearchText(berlinCoords)}`;
            search.value = '';
        }
        currentCoordinates = berlinCoords;
    } finally {
        // Hide loading indicator
        if (loadingIndicator) {
            loadingIndicator.hidden = true;
        }
    }
}

// Store current selected coordinates for search button
let currentCoordinates: Coordinates | null = null;

// Initialize the application
if (button && search) {
    // Handle city selection from search dropdown
    document.addEventListener('citySelected', (e: Event) => {
        const customEvent = e as CustomEvent<Coordinates>;
        currentCoordinates = customEvent.detail;
        fetchWeatherData(currentCoordinates, true, true); // Save this selection and show loading
    });

    // Handle search button click
    button.addEventListener('click', async (e) => {
        e.preventDefault();
        
        if (currentCoordinates) {
            // Use selected coordinates
            await fetchWeatherData(currentCoordinates, true, true); // Save this selection and show loading
        } else {
            // Try to search for the typed city name if there's input
            const cityName = search.value.trim();
            if (cityName === "") {
                // No input - focus the search to prompt user to type
                search.focus();
                search.placeholder = "Stadtname zum Suchen eingeben...";
                return;
            }
            
            // Simple search for exact city name
            try {
                const { searchCities } = await import('./weather-api.js');
                const cities = await searchCities(cityName);
                if (cities.length > 0 && cities[0]) {
                    currentCoordinates = cities[0];
                    await fetchWeatherData(cities[0], true, true); // Save this selection and show loading
                } else {
                    // Show error if no cities found
                    if (cityDisplay) {
                        cityDisplay.textContent = 'Stadt nicht gefunden';
                    }
                    if (weatherTypeDisplay) {
                        weatherTypeDisplay.textContent = 'Bitte versuchen Sie eine andere Stadt';
                    }
                }
            } catch (error) {
                console.error('Error searching for city:', error);
            }
        }
    });

    // Allow Enter key to submit
    search.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
            button.click();
        }
    });

    // Reset current coordinates when user types
    search.addEventListener('input', () => {
        currentCoordinates = null;
    });

    // Add keyboard shortcut to clear stored city (Ctrl+Shift+C)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            try {
                clearLastCity();
                
                // Show confirmation
                const announcement = document.createElement('div');
                announcement.setAttribute('aria-live', 'polite');
                announcement.className = 'sr-only';
                announcement.textContent = 'Gespeicherte Stadt gelöscht. Seite aktualisieren, um Berlin-Standard zu laden.';
                document.body.appendChild(announcement);
                
                setTimeout(() => {
                    if (announcement.parentNode) {
                        announcement.parentNode.removeChild(announcement);
                    }
                }, 2000);
                
                console.log('Stored city cleared via keyboard shortcut');
            } catch (error) {
                console.warn('Failed to clear stored city:', error);
            }
        }
    });
}

// Initialize search functionality and load default weather
initSearch();

// Load initial weather on page load
document.addEventListener('DOMContentLoaded', () => {
    loadInitialWeather();
});