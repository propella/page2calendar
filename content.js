// Content script: Extract text content from the page

// Message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPageContent') {
    const pageContent = extractPageContent();
    sendResponse(pageContent);
  }
  return true;
});

// Extract page content
function extractPageContent() {
  // Get text content from the page
  const bodyText = document.body.innerText;

  // Get page meta information
  const title = document.title;
  const url = window.location.href;

  // Get OGP information if available
  const ogTitle = getMetaContent('og:title');
  const ogDescription = getMetaContent('og:description');

  // Get structured data (JSON-LD) if available
  const jsonLdData = extractJsonLd();

  return {
    title: title,
    url: url,
    bodyText: bodyText.substring(0, 15000), // Limit if too long
    ogTitle: ogTitle,
    ogDescription: ogDescription,
    jsonLdData: jsonLdData
  };
}

// Get meta tag content
function getMetaContent(property) {
  const meta = document.querySelector(`meta[property="${property}"]`) ||
               document.querySelector(`meta[name="${property}"]`);
  return meta ? meta.getAttribute('content') : null;
}

// Extract JSON-LD data
function extractJsonLd() {
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  const data = [];

  scripts.forEach(script => {
    try {
      const parsed = JSON.parse(script.textContent);
      data.push(parsed);
    } catch (e) {
      // Ignore parse errors
    }
  });

  return data.length > 0 ? data : null;
}
