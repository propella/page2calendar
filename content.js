// Content script: ページからテキスト情報を抽出

// メッセージリスナー
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPageContent') {
    const pageContent = extractPageContent();
    sendResponse(pageContent);
  }
  return true;
});

// ページコンテンツを抽出
function extractPageContent() {
  // ページのテキストコンテンツを取得
  const bodyText = document.body.innerText;

  // ページのメタ情報も取得
  const title = document.title;
  const url = window.location.href;

  // OGP情報も取得（あれば）
  const ogTitle = getMetaContent('og:title');
  const ogDescription = getMetaContent('og:description');

  // 構造化データ（JSON-LD）を取得（あれば）
  const jsonLdData = extractJsonLd();

  return {
    title: title,
    url: url,
    bodyText: bodyText.substring(0, 15000), // 長すぎる場合は制限
    ogTitle: ogTitle,
    ogDescription: ogDescription,
    jsonLdData: jsonLdData
  };
}

// メタタグの内容を取得
function getMetaContent(property) {
  const meta = document.querySelector(`meta[property="${property}"]`) ||
               document.querySelector(`meta[name="${property}"]`);
  return meta ? meta.getAttribute('content') : null;
}

// JSON-LDデータを抽出
function extractJsonLd() {
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  const data = [];

  scripts.forEach(script => {
    try {
      const parsed = JSON.parse(script.textContent);
      data.push(parsed);
    } catch (e) {
      // パース失敗は無視
    }
  });

  return data.length > 0 ? data : null;
}
