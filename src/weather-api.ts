/**
 * Weather API integration using Open-Meteo API
 * Open-Meteo is free, reliable, and doesn't require API keys
 */

export interface WeatherData {
    temperature: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    weatherCode: number;
    weatherDescription: string;
    cityName: string;
    country: string | undefined;
    postcodes?: string[];
}

export interface Coordinates {
    lat: number;
    lon: number;
    name: string;
    country?: string;
    postcodes?: string[];
}

/**
 * Maps Open-Meteo weather codes to weather conditions and images
 */
const weatherCodeMap: Record<number, { condition: string; image: string; background: string }> = {
    0: { condition: 'Klarer Himmel', image: 'sunny.png', background: 'sunny' },
    1: { condition: 'Überwiegend klar', image: 'sunny.png', background: 'sunny' },
    2: { condition: 'Teilweise bewölkt', image: 'cloudy_sunny.png', background: 'sunny' },
    3: { condition: 'Bedeckt', image: 'cloudy.png', background: 'cloudy' },
    45: { condition: 'Neblig', image: 'cloudy.png', background: 'cloudy' },
    48: { condition: 'Eisnebel', image: 'cloudy.png', background: 'cloudy' },
    51: { condition: 'Nieselregen', image: 'sunny_rain.png', background: 'cloudy' },
    53: { condition: 'Nieselregen', image: 'sunny_rain.png', background: 'cloudy' },
    55: { condition: 'Starker Niesel', image: 'sunny_rain.png', background: 'cloudy' },
    56: { condition: 'Eisregen', image: 'sunny_rain.png', background: 'cloudy' },
    57: { condition: 'Starker Eisregen', image: 'sunny_rain.png', background: 'cloudy' },
    61: { condition: 'Leichter Regen', image: 'sunny_rain.png', background: 'cloudy' },
    63: { condition: 'Mäßiger Regen', image: 'sunny_rain.png', background: 'cloudy' },
    65: { condition: 'Starker Regen', image: 'sunny_rain.png', background: 'cloudy' },
    66: { condition: 'Eisregen', image: 'sunny_rain.png', background: 'cloudy' },
    67: { condition: 'Starker Eisregen', image: 'sunny_rain.png', background: 'cloudy' },
    71: { condition: 'Leichter Schnee', image: 'cloudy.png', background: 'cloudy' },
    73: { condition: 'Mäßiger Schnee', image: 'cloudy.png', background: 'cloudy' },
    75: { condition: 'Starker Schnee', image: 'cloudy.png', background: 'cloudy' },
    77: { condition: 'Schneekörner', image: 'cloudy.png', background: 'cloudy' },
    80: { condition: 'Regenschauer', image: 'sunny_rain.png', background: 'cloudy' },
    81: { condition: 'Regenschauer', image: 'sunny_rain.png', background: 'cloudy' },
    82: { condition: 'Starke Schauer', image: 'sunny_rain.png', background: 'cloudy' },
    85: { condition: 'Schneeschauer', image: 'cloudy.png', background: 'cloudy' },
    86: { condition: 'Starke Schneeschauer', image: 'cloudy.png', background: 'cloudy' },
    95: { condition: 'Gewitter', image: 'sunny_rain.png', background: 'cloudy' },
    96: { condition: 'Gewitter & Hagel', image: 'sunny_rain.png', background: 'cloudy' },
    99: { condition: 'Schweres Gewitter', image: 'sunny_rain.png', background: 'cloudy' }
};

/**
 * Gets weather mapping data from weather code
 */
export function getWeatherInfo(weatherCode: number): { condition: string; image: string; background: string } {
    const defaultWeather = { condition: 'Klarer Himmel', image: 'sunny.png', background: 'sunny' };
    return weatherCodeMap[weatherCode] || defaultWeather;
}

/**
 * Searches for cities using Open-Meteo Geocoding API
 * @param query City name to search for
 * @returns Promise with array of matching cities
 */
export async function searchCities(query: string): Promise<Coordinates[]> {
    if (!query.trim()) return [];
    
    try {
        const encodedQuery = encodeURIComponent(query.trim());
        const response = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodedQuery}&count=5&language=en&format=json`
        );
        
        if (!response.ok) {
            throw new Error(`Geocoding API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.results) {
            return [];
        }
        
        return data.results.map((result: any) => ({
            lat: result.latitude,
            lon: result.longitude,
            name: result.name,
            country: result.country || result.admin1,
            postcodes: result.postcodes || []
        }));
    } catch (error) {
        console.error('Error searching cities:', error);
        return [];
    }
}

/**
 * Fetches current weather data from Open-Meteo API
 * @param coordinates City coordinates
 * @returns Promise with weather data
 */
export async function getCurrentWeather(coordinates: Coordinates): Promise<WeatherData> {
    try {
        const { lat, lon, name, country } = coordinates;
        
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto&forecast_days=1`
        );
        
        if (!response.ok) {
            throw new Error(`Weather API error: ${response.status}`);
        }
        
        const data = await response.json();
        const current = data.current;
        
        const weatherInfo = getWeatherInfo(current.weather_code);
        
        return {
            temperature: Math.round(current.temperature_2m),
            feelsLike: Math.round(current.apparent_temperature),
            humidity: current.relative_humidity_2m,
            windSpeed: Math.round(current.wind_speed_10m * 10) / 10, // Round to 1 decimal
            weatherCode: current.weather_code,
            weatherDescription: weatherInfo.condition,
            cityName: name,
            country: country || undefined,
            postcodes: coordinates.postcodes || []
        };
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw new Error('Fehler beim Laden der Wetterdaten. Bitte versuchen Sie es erneut.');
    }
}

/**
 * Gets coordinates for Berlin, Germany (default city)
 */
export function getBerlinCoordinates(): Coordinates {
    return {
        lat: 52.52,
        lon: 13.405,
        name: 'Berlin',
        country: 'Deutschland',
        postcodes: ['10115', '10117', '10119'] // Some common Berlin postal codes
    };
}