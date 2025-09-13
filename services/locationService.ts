/**
 * Attempts to get the user's country code using the browser's Geolocation API
 * and a reverse geocoding service.
 * @returns A promise that resolves to the user's two-letter country code (e.g., 'in', 'us')
 * or null if it cannot be determined.
 */
export async function getUserCountry(): Promise<string | null> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Use OpenStreetMap's free Nominatim reverse geocoding service
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
          if (!response.ok) {
            throw new Error(`Reverse geocoding failed with status: ${response.status}`);
          }
          const data = await response.json();
          // The country code is usually in address.country_code
          const countryCode = data?.address?.country_code;
          if (countryCode && typeof countryCode === 'string') {
            resolve(countryCode);
          } else {
            resolve(null); // Could not find country code in response
          }
        } catch (error) {
          reject(error);
        }
      },
      (error) => {
        // Handle geolocation errors (e.g., user denied permission)
        reject(error);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000, // 10 seconds timeout
        maximumAge: 3600000 // 1 hour cache
      }
    );
  });
}