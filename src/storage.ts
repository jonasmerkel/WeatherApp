/**
 * Local Storage utility for persisting user's last selected city
 */

import type { Coordinates } from './weather-api.js';

const STORAGE_KEY = 'weather-app-last-city';

export interface StoredCity extends Coordinates {
    timestamp: number;
    searchText: string; // What was displayed in the search field
}

/**
 * Saves the last selected city to localStorage
 * @param coordinates City coordinates and details
 * @param searchText The text that was shown in search field
 */
export function saveLastCity(coordinates: Coordinates, searchText: string): void {
    try {
        const cityData: StoredCity = {
            ...coordinates,
            timestamp: Date.now(),
            searchText: searchText
        };
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cityData));
        console.log('Saved last city:', cityData.name);
    } catch (error) {
        console.warn('Failed to save city to localStorage:', error);
    }
}

/**
 * Retrieves the last selected city from localStorage
 * @param maxAgeHours Maximum age in hours (default: 24 hours)
 * @returns StoredCity or null if not found or expired
 */
export function getLastCity(maxAgeHours: number = 24): StoredCity | null {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            return null;
        }

        const cityData: StoredCity = JSON.parse(stored);
        
        // Check if data is expired
        const ageInHours = (Date.now() - cityData.timestamp) / (1000 * 60 * 60);
        if (ageInHours > maxAgeHours) {
            console.log('Stored city data expired, removing...');
            clearLastCity();
            return null;
        }

        // Validate required properties
        if (!cityData.lat || !cityData.lon || !cityData.name) {
            console.warn('Invalid stored city data, removing...');
            clearLastCity();
            return null;
        }

        console.log('Retrieved last city:', cityData.name);
        return cityData;
    } catch (error) {
        console.warn('Failed to retrieve city from localStorage:', error);
        clearLastCity();
        return null;
    }
}

/**
 * Clears the stored city data
 */
export function clearLastCity(): void {
    try {
        localStorage.removeItem(STORAGE_KEY);
        console.log('Cleared stored city data');
    } catch (error) {
        console.warn('Failed to clear stored city data:', error);
    }
}

/**
 * Checks if localStorage is available
 */
export function isStorageAvailable(): boolean {
    try {
        const testKey = 'test-storage';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
        return true;
    } catch {
        return false;
    }
}