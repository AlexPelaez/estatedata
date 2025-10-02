// Function to insert HUD text on realtor property details page
function insertHudText() {
  const saleLabel = document.querySelector('span[data-testid="for-sale"]');
  if (!saleLabel) return;

  const badgeContainer = saleLabel.closest('[data-testid="status-indicator"]') || saleLabel.parentElement;

  if (badgeContainer.previousElementSibling && badgeContainer.previousElementSibling.classList.contains('podai-button-container')) {
    return;
  }

  const container = document.createElement('div');
  container.className = 'podai-button-container';

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

// Export the function for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { insertHudText };
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
    const zipCode = Utils.extractZipCode(address);
    if (!zipCode) {
      console.error('Could not extract zip code from address:', address);
      updateHUDDisplay(null);
      return;
    }
    
    console.log('Zip code extracted:', zipCode);
    
    // Find rent value
    const rentValue = Utils.findRentValue(hud, zipCode, bedroomCount);
    
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
    const zipCode = Utils.extractZipCode(address);
    if (!zipCode) {
      console.error('Could not extract zip code from address:', address);
      updateHUDDisplay(null);
      return;
    }
    
    console.log('Zip code extracted:', zipCode);
    
    // Find rent value
    const rentValue = Utils.findRentValue(hud, zipCode, bedroomCount);
    
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

// Initialize HUD functionality for property details when page loads
insertHudText();