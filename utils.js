// Utils class for HUD data processing
class Utils {
  // Extract zip code from address string
  static extractZipCode(address) {
    if (!address) return null;
    
    // Clean the address string - remove common suffixes and extra text
    let cleanAddress = address
      .replace(/\s*View on map.*$/i, '') // Remove "View on map" and anything after
      .replace(/\s*Show on map.*$/i, '') // Remove "Show on map" and anything after
      .replace(/\s*Get directions.*$/i, '') // Remove "Get directions" and anything after
      .replace(/\s*Directions.*$/i, '') // Remove "Directions" and anything after
      .trim();
    
    // Multiple patterns to find zip code
    const patterns = [
      /\b(\d{5})\b/, // Standard 5-digit zip
      /\b(\d{5})-\d{4}\b/, // ZIP+4 format (take first 5 digits)
      /,\s*[A-Z]{2}\s+(\d{5})\b/, // "City, ST 12345" format
      /\b(\d{5})\s*$/, // 5 digits at end of string
      /\b(\d{5})\s*[A-Z]/, // 5 digits followed by letter (like "35802View")
    ];
    
    for (const pattern of patterns) {
      const match = cleanAddress.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    // If no pattern matches, try a more aggressive approach
    // Look for any sequence of 5 consecutive digits
    const aggressiveMatch = cleanAddress.match(/(\d{5})/);
    if (aggressiveMatch) {
      return aggressiveMatch[1];
    }
    
    return null;
  }

  // Find rent value for zip code and bedroom count
  static findRentValue(hudData, zipCode, bedroomCount) {
    if (!hudData || bedroomCount === null) return null;
    
    // Default values when zip code is not found
    const defaultValues = {
      0: '$1,103',
      1: '$1,285', 
      2: '$1,657',
      3: '$2,023',
      4: '$2,326',
      5: '$2,326' // Use 4 BR value for 5+ BR
    };
    
    // If no zip code provided, return default value
    if (!zipCode) {
      return defaultValues[bedroomCount] || defaultValues[5];
    }
    
    const row = hudData.find(item => item['ZIP Code'] === zipCode);
    
    // If zip code not found in HUD data, return default value
    if (!row) {
      return defaultValues[bedroomCount] || defaultValues[5];
    }
    
    // Map bedroom count to column name
    const bedroomColumns = {
      0: '0 BR',
      1: '1 BR', 
      2: '2 BR',
      3: '3 BR',
      4: '4 BR',
      5: '5 BR'
    };
    
    const columnName = bedroomColumns[bedroomCount];
    if (!columnName || !row[columnName]) {
      // If specific bedroom count not found, return default value
      return defaultValues[bedroomCount] || defaultValues[5];
    }
    
    return row[columnName];
  }
}
