// HUD metrics logic for Realtor property cards page
// This page handles adding HUD rental standards to property cards

// Function to add HUD rent text to property cards
function addHudTextToPropertyCards() {
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
      // Get HUD data from shared utilities
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
      
      // Extract zip code using shared utility
      const zipCode = Utils.extractZipCode(address);
      if (!zipCode) {
        console.error('Could not extract zip code from address:', address);
        return;
      }
      
      console.log('Zip code extracted from card:', zipCode);
      
      // Find rent value using shared utility
      const rentValue = Utils.findRentValue(hud, zipCode, bedroomCount);
      
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

// Function to observe beds and address and add HUD text when new property cards are loaded
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
      setTimeout(addHudTextToPropertyCards, 100);
    }
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
}

// Initialize HUD functionality for property cards
function initializePropertyCardsHUD() {
  // Initial check for existing property cards
  setTimeout(addHudTextToPropertyCards, 1000);
  
  // Start observing for new property cards
  observePropertyCards();
}

// Initialize HUD functionality for property cards when page loads
initializePropertyCardsHUD();

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    addHudTextToPropertyCards, 
    observePropertyCards, 
    initializePropertyCardsHUD 
  };
}
