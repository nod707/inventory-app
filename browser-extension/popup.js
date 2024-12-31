document.addEventListener('DOMContentLoaded', () => {
  const statusDiv = document.getElementById('status');
  const startSearchButton = document.getElementById('startSearch');

  // Check connection to our app
  fetch('http://localhost:3000/api/health')
    .then(response => {
      if (response.ok) {
        statusDiv.textContent = 'Connected to Inventory App';
        statusDiv.className = 'status connected';
        startSearchButton.disabled = false;
      } else {
        throw new Error('App not responding');
      }
    })
    .catch(error => {
      statusDiv.textContent = 'Not connected to Inventory App';
      statusDiv.className = 'status disconnected';
      startSearchButton.disabled = true;
    });

  // Handle search button click
  startSearchButton.addEventListener('click', () => {
    startSearchButton.disabled = true;
    startSearchButton.textContent = 'Searching...';
    
    // Send message to background script to start search
    chrome.runtime.sendMessage(
      { 
        action: 'startSearch',
        query: 'Nike Tech Fleece'
      },
      (response) => {
        if (response && response.status === 'Search started') {
          statusDiv.textContent = 'Search in progress...';
          statusDiv.className = 'status connected';
          
          // Re-enable button after 5 seconds
          setTimeout(() => {
            startSearchButton.disabled = false;
            startSearchButton.textContent = 'Start New Search';
          }, 5000);
        } else {
          statusDiv.textContent = 'Search failed to start';
          statusDiv.className = 'status disconnected';
          startSearchButton.disabled = false;
          startSearchButton.textContent = 'Start New Search';
        }
      }
    );
  });
});
