// HUD data - hardcoded
const hudData = [
  { "ZIP Code": "35749", "City/Area": "Harvest", "0 BR": "$1,071", "1 BR": "$1,236", "2 BR": "$1,442", "3 BR": "$1,854", "4 BR": "$2,266", "5 BR": "$2,606" },
  { "ZIP Code": "35756", "City/Area": "Madison", "0 BR": "$1,432", "1 BR": "$1,658", "2 BR": "$1,926", "3 BR": "$2,482", "4 BR": "$3,028", "5 BR": "$3,482" },
  { "ZIP Code": "35757", "City/Area": "Madison", "0 BR": "$1,308", "1 BR": "$1,514", "2 BR": "$1,761", "3 BR": "$2,260", "4 BR": "$2,771", "5 BR": "$3,186" },
  { "ZIP Code": "35758", "City/Area": "Madison", "0 BR": "$1,133", "1 BR": "$1,308", "2 BR": "$1,524", "3 BR": "$1,963", "4 BR": "$2,400", "5 BR": "$2,760" },
  { "ZIP Code": "35759", "City/Area": "Meridianville", "0 BR": "$1,213", "1 BR": "$1,442", "2 BR": "$1,679", "3 BR": "$2,184", "4 BR": "$2,606", "5 BR": "$2,997" },
  { "ZIP Code": "35763", "City/Area": "Owens Cross Roads", "0 BR": "$1,432", "1 BR": "$1,658", "2 BR": "$1,926", "3 BR": "$2,482", "4 BR": "$3,028", "5 BR": "$3,482" },
  { "ZIP Code": "35773", "City/Area": "Toney", "0 BR": "$927", "1 BR": "$1,071", "2 BR": "$1,246", "3 BR": "$1,607", "4 BR": "$1,957", "5 BR": "$2,251" },
  { "ZIP Code": "35801", "City/Area": "", "0 BR": "$1,051", "1 BR": "$1,215", "2 BR": "$1,411", "3 BR": "$1,823", "4 BR": "$2,225", "5 BR": "$2,559" },
  { "ZIP Code": "35802", "City/Area": "", "0 BR": "$958", "1 BR": "$1,102", "2 BR": "$1,288", "3 BR": "$1,658", "4 BR": "$2,029", "5 BR": "$2,333" },
  { "ZIP Code": "35803", "City/Area": "", "0 BR": "$1,030", "1 BR": "$1,185", "2 BR": "$1,380", "3 BR": "$1,782", "4 BR": "$2,070", "5 BR": "$2,381" },
  { "ZIP Code": "35806", "City/Area": "", "0 BR": "$1,123", "1 BR": "$1,288", "2 BR": "$1,504", "3 BR": "$1,936", "4 BR": "$2,239", "5 BR": "$2,575" },
  { "ZIP Code": "35824", "City/Area": "", "0 BR": "$1,051", "1 BR": "$1,215", "2 BR": "$1,411", "3 BR": "$1,823", "4 BR": "$2,225", "5 BR": "$2,559" }
];

// Get HUD data (now synchronous)
function getHUDData() {
  return hudData;
}

// Extract zip code from address string
function extractZipCode(address) {
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
function findRentValue(hudData, zipCode, bedroomCount) {
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

// Scrape data and check HUD
function checkHUD() {
  try {
    console.log('Starting HUD check...');
    
    // Get HUD data
    const hud = getHUDData();
    if (!hud) {
      console.error('Failed to get HUD data');
      return;
    }
    
    // Scrape beds data
    const bedsXPath = '/html/body/div[2]/div/main/div[2]/div[2]/div[1]/div[3]/div[3]/div[1]/div[4]/ul/li[1]/span';
    const bedsElement = document.evaluate(bedsXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    
    if (!bedsElement) {
      console.error('Could not find beds element');
      return;
    }
    
    const bedsText = bedsElement.textContent.trim();
    const bedroomCount = parseInt(bedsText.match(/\d+/)?.[0]);
    
    if (isNaN(bedroomCount)) {
      console.error('Could not parse bedroom count from:', bedsText);
      return;
    }
    
    console.log('Beds found:', bedroomCount);
    
    // Scrape address data
    const addressXPath = '/html/body/div[2]/div/main/div[2]/div[2]/div[1]/div[3]/div[3]/div[1]/div[4]/div/h1';
    const addressElement = document.evaluate(addressXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    
    if (!addressElement) {
      console.error('Could not find address element');
      return;
    }
    
    const address = addressElement.textContent.trim();
    console.log('Address found:', address);
    
    // Extract zip code
    const zipCode = extractZipCode(address);
    if (!zipCode) {
      console.error('Could not extract zip code from address:', address);
      return;
    }
    
    console.log('Zip code extracted:', zipCode);
    
    // Find rent value
    const rentValue = findRentValue(hud, zipCode, bedroomCount);
    
    if (rentValue) {
      console.log(`HUD Rent for ${bedroomCount} BR in zip ${zipCode}: ${rentValue}`);
    } else {
      console.log(`No HUD data found for ${bedroomCount} BR in zip ${zipCode}`);
    }
    
  } catch (error) {
    console.error('Error during HUD check:', error);
  }
}

// Global reference to HUD display element
let hudDisplayElement = null;

// Update HUD display with result
function updateHUDDisplay(rentValue) {
  if (hudDisplayElement) {
    if (rentValue) {
      hudDisplayElement.textContent = `Section 8 Rental Standard: ${rentValue}`;
    } else {
      hudDisplayElement.textContent = 'Section 8 Rental Standard: N/A';
    }
  }
}

// Modified checkHUD to update display instead of just logging
function checkHUD() {
  try {
    console.log('Starting HUD check...');
    
    // Update display to show loading
    if (hudDisplayElement) {
      hudDisplayElement.textContent = 'Section 8 Rental Standard: Loading...';
    }
    
    // Get HUD data
    const hud = getHUDData();
    if (!hud) {
      console.error('Failed to get HUD data');
      updateHUDDisplay(null);
      return;
    }
    
    // Scrape beds data
    const bedsElement = document.querySelector('li[data-testid="property-meta-beds"] span[data-testid="meta-value"]');
    
    if (!bedsElement) {
      console.error('Could not find beds element');
      updateHUDDisplay(null);
      return;
    }
    
    const bedsText = bedsElement.textContent.trim();
    const bedroomCount = parseInt(bedsText.match(/\d+/)?.[0]);
    
    if (isNaN(bedroomCount)) {
      console.error('Could not parse bedroom count from:', bedsText);
      updateHUDDisplay(null);
      return;
    }
    
    console.log('Beds found:', bedroomCount);
    
    // Scrape address data
    const addressElement = document.querySelector('#__next > div > main > div.Boxstyles__StyledBox-rui__sc-1p1qqov-0.cXEYei.Containerstyles__StyledContainer-rui__sc-1t8ewky-0.cAQRUe > div.FlexLayoutstyles__StyledFlexLayout-rui__xa1an4-0.eflErG > div.FlexLayoutMain__StyledFlexLayoutMain-rui__m7m0sj-0.hzKDHY > div.sc-4053d4e0-0.bqgcFw > div.Boxstyles__StyledBox-rui__sc-1p1qqov-0.dVSfks.sc-990b7565-10.RWFHJ > div.Boxstyles__StyledBox-rui__sc-1p1qqov-0.kfBpRM.sc-990b7565-11.hVJYrs > div.Boxstyles__StyledBox-rui__sc-1p1qqov-0.jXEwSo.sc-c02d43d0-1.edABNw > div');
    
    if (!addressElement) {
      console.error('Could not find address element');
      updateHUDDisplay(null);
      return;
    }
    
    const address = addressElement.textContent.trim();
    console.log('Address found:', address);
    
    // Extract zip code
    const zipCode = extractZipCode(address);
    if (!zipCode) {
      console.error('Could not extract zip code from address:', address);
      updateHUDDisplay(null);
      return;
    }
    
    console.log('Zip code extracted:', zipCode);
    
    // Find rent value
    const rentValue = findRentValue(hud, zipCode, bedroomCount);
    
    if (rentValue) {
      console.log(`HUD Rent for ${bedroomCount} BR in zip ${zipCode}: ${rentValue}`);
    } else {
      console.log(`No HUD data found for ${bedroomCount} BR in zip ${zipCode}`);
    }
    
    // Update display with result
    updateHUDDisplay(rentValue);
    
  } catch (error) {
    console.error('Error during HUD check:', error);
    updateHUDDisplay(null);
  }
}

function insertPodaiButtons() {
  const saleLabel = document.querySelector('span[data-testid="for-sale"]');
  if (!saleLabel) return;

  const badgeContainer = saleLabel.closest('[data-testid="status-indicator"]') || saleLabel.parentElement;

  if (badgeContainer.previousElementSibling && badgeContainer.previousElementSibling.classList.contains('podai-button-container')) {
    return;
  }

  const container = document.createElement('div');
  container.className = 'podai-button-container';

  // Commented out button code - keeping for reference
  // ['Check HUD'].forEach(label => {
  //   const btn = document.createElement('button');
  //   btn.textContent = label;
  //   btn.className = 'podai-btn';
  //   btn.addEventListener('click', checkHUD);
  //   container.appendChild(btn);
  // });

  // Display HUD price directly
  hudDisplayElement = document.createElement('div');
  hudDisplayElement.className = 'hud-display';
  hudDisplayElement.style.cssText = 'padding-right: 20px; font-weight: bold; color: #333;';
  hudDisplayElement.textContent = 'Section 8 Rental Standard: Loading...';

  container.appendChild(hudDisplayElement);
  badgeContainer.parentNode.insertBefore(container, badgeContainer);
  
  // Call checkHUD after a short delay to ensure elements are available
  setTimeout(() => {
    checkHUD();
  }, 1000);
}

// Function to add HUD rent text to property cards
function addTestTextToPropertyCards() {
  // Find all property cards using a more flexible selector
  // We'll look for elements that contain the card-content class and have the property ID pattern
  const propertyCards = document.querySelectorAll('[id^="property_id_"] .card-content');
  
  propertyCards.forEach(card => {
    // Check if we've already added the HUD text to this card
    if (card.querySelector('.hud-rent-added')) {
      return;
    }
    
    // Find the target div with StatusBadge class and card-description
    const targetDiv = card.querySelector('.StatusBadgestyles__StyledStatusBadge-rui__sc-126lhut-0.isTFRK.card-description > div');
    
    if (!targetDiv) {
      return;
    }
    
    try {
      // Get HUD data
      const hud = getHUDData();
      if (!hud) {
        console.error('Failed to get HUD data for property card');
        return;
      }
      
      // Scrape beds data from the card
      const bedsElement = card.querySelector('ul > li.PropertyBedMetastyles__StyledPropertyBedMeta-rui__b7i62o-0.iEHfOT');
      
      if (!bedsElement) {
        console.error('Could not find beds element in property card');
        return;
      }
      
      const bedsText = bedsElement.textContent.trim();
      const bedroomCount = parseInt(bedsText.match(/\d+/)?.[0]);
      
      if (isNaN(bedroomCount)) {
        console.error('Could not parse bedroom count from:', bedsText);
        return;
      }
      
      console.log('Beds found in card:', bedroomCount);
      
      // Scrape address data from the card
      const addressElement = card.querySelector('div.content-row > div.content-col-left > div > div:nth-child(2)');
      
      if (!addressElement) {
        console.error('Could not find address element in property card');
        return;
      }
      
      const address = addressElement.textContent.trim();
      console.log('Address found in card:', address);
      
      // Extract zip code
      const zipCode = extractZipCode(address);
      if (!zipCode) {
        console.error('Could not extract zip code from address:', address);
        return;
      }
      
      console.log('Zip code extracted from card:', zipCode);
      
      // Find rent value
      const rentValue = findRentValue(hud, zipCode, bedroomCount);
      
      // Create the HUD rent span
      const hudSpan = document.createElement('span');
      hudSpan.className = 'hud-rent-added';
      
      if (rentValue) {
        hudSpan.textContent = ` HUD: ${rentValue}`;
        hudSpan.style.cssText = 'margin-left: 8px; padding: 2px 6px; background-color: #e8f5e8; border: 1px solid #4caf50; border-radius: 3px; font-weight: bold; color: #2e7d32; font-size: 0.9em;';
        console.log(`HUD Rent for ${bedroomCount} BR in zip ${zipCode}: ${rentValue}`);
      } else {
        hudSpan.textContent = ' HUD: N/A';
        hudSpan.style.cssText = 'margin-left: 8px; padding: 2px 6px; background-color: #fff3e0; border: 1px solid #ff9800; border-radius: 3px; font-weight: bold; color: #f57c00; font-size: 0.9em;';
        console.log(`No HUD data found for ${bedroomCount} BR in zip ${zipCode}`);
      }
      
      // Append the HUD span to the target div
      targetDiv.appendChild(hudSpan);
      
    } catch (error) {
      console.error('Error processing property card for HUD data:', error);
    }
  });
}

// Function to observe and add TEST text when new property cards are loaded
function observePropertyCards() {
  const observer = new MutationObserver((mutations) => {
    let shouldCheck = false;
    
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Check if any added nodes contain property cards
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.matches && node.matches('[id^="property_id_"]')) {
              shouldCheck = true;
            } else if (node.querySelector && node.querySelector('[id^="property_id_"]')) {
              shouldCheck = true;
            }
          }
        });
      }
    });
    
    if (shouldCheck) {
      setTimeout(addTestTextToPropertyCards, 100);
    }
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
}

insertPodaiButtons();

// Initial check for existing property cards
setTimeout(addTestTextToPropertyCards, 1000);

// Start observing for new property cards
observePropertyCards();

const observer = new MutationObserver(insertPodaiButtons);
observer.observe(document.body, { childList: true, subtree: true });
