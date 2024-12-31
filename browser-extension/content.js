// Selectors for different marketplaces
const MARKETPLACE_CONFIGS = {
  'mercari.com': {
    listingContainer: '.items-grid',
    listingCard: '.items-box',
    listingData: {
      title: '.items-box-name',
      price: '.items-box-price',
      image: '.items-box-photo img',
      url: '.items-box-photo',
      condition: '.items-box-condition',
      seller: '.items-box-seller'
    }
  },
  'poshmark.com': {
    listingContainer: '.tile-container',
    listingCard: '.card',
    listingData: {
      title: '.title',
      price: '.price',
      image: '.img-fluid',
      url: 'a',
      condition: '.condition',
      seller: '.seller'
    }
  },
  'ebay.com': {
    listingContainer: '.srp-results',
    listingCard: '.s-item',
    listingData: {
      title: '.s-item__title',
      price: '.s-item__price',
      image: '.s-item__image-img',
      url: '.s-item__link',
      condition: '.s-item__condition',
      seller: '.s-item__seller-info'
    }
  }
};

// Function to extract listings from search results
function extractListings(maxListings = 10) {
  const host = window.location.hostname;
  const config = MARKETPLACE_CONFIGS[host.replace('www.', '')];
  
  if (!config) return [];

  const container = document.querySelector(config.listingContainer);
  if (!container) return [];

  const cards = container.querySelectorAll(config.listingCard);
  const listings = [];

  for (let i = 0; i < Math.min(cards.length, maxListings); i++) {
    const card = cards[i];
    const data = config.listingData;

    const getElementText = (selector) => {
      const el = card.querySelector(selector);
      return el ? el.textContent.trim() : '';
    };

    const getElementAttr = (selector, attr) => {
      const el = card.querySelector(selector);
      return el ? el.getAttribute(attr) : '';
    };

    const listing = {
      title: getElementText(data.title),
      price: getElementText(data.price),
      images: [getElementAttr(data.image, 'src')].filter(Boolean),
      condition: getElementText(data.condition),
      seller: getElementText(data.seller),
      source: {
        url: new URL(card.querySelector(data.url).href, window.location.origin).href,
        marketplace: host
      }
    };

    listings.push(listing);
  }

  return listings;
}

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractListings') {
    const listings = extractListings(request.maxListings);
    sendResponse({ listings });
  }
});

// Function to send listings to our app
async function sendListingsToApp(listings, marketplace) {
  try {
    await fetch('http://localhost:3000/api/market-research/listings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        marketplace,
        listings
      })
    });
  } catch (error) {
    console.error('Error sending listings:', error);
  }
}

// Automatically extract and send listings when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const listings = extractListings();
    const marketplace = window.location.hostname.replace('www.', '');
    sendListingsToApp(listings, marketplace);
  });
} else {
  const listings = extractListings();
  const marketplace = window.location.hostname.replace('www.', '');
  sendListingsToApp(listings, marketplace);
}
