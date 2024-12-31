// Search URLs for each marketplace
const MARKETPLACE_URLS = {
  mercari: 'https://www.mercari.com/search/?keyword=',
  poshmark: 'https://poshmark.com/search?q=',
  ebay: 'https://www.ebay.com/sch/i.html?_nkw='
};

// Keep track of search tabs
let searchTabs = {};

// Listen for messages from popup or content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startSearch') {
    const query = encodeURIComponent(request.query || 'Nike Tech Fleece');
    
    // Close any existing search tabs
    Object.values(searchTabs).forEach(tabId => {
      if (tabId) chrome.tabs.remove(tabId);
    });
    
    // Clear search tabs
    searchTabs = {};
    
    // Open new tabs for each marketplace
    Object.entries(MARKETPLACE_URLS).forEach(([marketplace, baseUrl]) => {
      chrome.tabs.create(
        { 
          url: baseUrl + query,
          active: false 
        },
        (tab) => {
          searchTabs[marketplace] = tab.id;
        }
      );
    });
    
    sendResponse({ status: 'Search started' });
  }
  
  return true; // Keep the message channel open for async response
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Check if this is one of our search tabs and it's done loading
  const marketplace = Object.keys(searchTabs).find(key => searchTabs[key] === tabId);
  
  if (marketplace && changeInfo.status === 'complete') {
    // Tell the content script to extract listings
    chrome.tabs.sendMessage(tabId, { 
      action: 'extractListings',
      marketplace: marketplace
    });
  }
});
