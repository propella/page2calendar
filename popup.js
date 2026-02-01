// Popup script: Main logic

document.addEventListener('DOMContentLoaded', async () => {
  // Apply i18n translations
  applyI18n();

  // Get DOM elements
  const providerSelect = document.getElementById('provider');
  const apiKeyInput = document.getElementById('apiKey');
  const saveApiKeyBtn = document.getElementById('saveApiKey');
  const extractBtn = document.getElementById('extractBtn');
  const loading = document.getElementById('loading');
  const error = document.getElementById('error');
  const resultSection = document.getElementById('resultSection');
  const registerBtn = document.getElementById('registerBtn');

  // Form elements
  const titleInput = document.getElementById('title');
  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');
  const locationInput = document.getElementById('location');
  const descriptionInput = document.getElementById('description');
  const urlInput = document.getElementById('url');

  // Update placeholder based on provider
  function updatePlaceholder() {
    const provider = providerSelect.value;
    if (provider === 'claude') {
      apiKeyInput.placeholder = 'sk-ant-...';
    } else {
      apiKeyInput.placeholder = 'AIza...';
    }
  }

  // Load saved settings
  const stored = await chrome.storage.local.get(['provider', 'claudeApiKey', 'geminiApiKey']);
  if (stored.provider) {
    providerSelect.value = stored.provider;
  }
  updatePlaceholder();

  // Load the appropriate API key based on provider
  const currentProvider = providerSelect.value;
  if (currentProvider === 'claude' && stored.claudeApiKey) {
    apiKeyInput.value = stored.claudeApiKey;
  } else if (currentProvider === 'gemini' && stored.geminiApiKey) {
    apiKeyInput.value = stored.geminiApiKey;
  }

  // Provider change handler
  providerSelect.addEventListener('change', async () => {
    const provider = providerSelect.value;
    updatePlaceholder();

    // Load the API key for the selected provider
    const stored = await chrome.storage.local.get(['claudeApiKey', 'geminiApiKey']);
    if (provider === 'claude') {
      apiKeyInput.value = stored.claudeApiKey || '';
    } else {
      apiKeyInput.value = stored.geminiApiKey || '';
    }

    // Save provider preference
    await chrome.storage.local.set({ provider: provider });
  });

  // Save API key
  saveApiKeyBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    const provider = providerSelect.value;
    if (apiKey) {
      if (provider === 'claude') {
        await chrome.storage.local.set({ claudeApiKey: apiKey });
      } else {
        await chrome.storage.local.set({ geminiApiKey: apiKey });
      }
      showMessage('', false);
    }
  });

  // Extract information button
  extractBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
      showError(chrome.i18n.getMessage('errorApiKeyRequired'));
      return;
    }

    showLoading(true);
    hideError();
    hideResult();

    try {
      // Get page information from current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      // Send message to content script
      const pageContent = await chrome.tabs.sendMessage(tab.id, { action: 'getPageContent' });

      // Extract information using selected AI provider
      const provider = providerSelect.value;
      const extractedData = provider === 'claude'
        ? await extractWithClaude(apiKey, pageContent)
        : await extractWithGemini(apiKey, pageContent);

      // Display results
      displayResult(extractedData, pageContent.url);
    } catch (err) {
      showError(chrome.i18n.getMessage('errorOccurred', [err.message]));
    } finally {
      showLoading(false);
    }
  });

  // Register to calendar button
  registerBtn.addEventListener('click', () => {
    const eventData = {
      title: titleInput.value,
      startDate: startDateInput.value,
      endDate: endDateInput.value,
      location: locationInput.value,
      description: descriptionInput.value,
      url: urlInput.value
    };

    const calendarUrl = generateGoogleCalendarUrl(eventData);
    chrome.tabs.create({ url: calendarUrl });
  });

  // Build prompt for extraction
  function buildPrompt(pageContent) {
    return `以下のウェブページの内容から、美術展・展覧会の情報を抽出してください。

ページタイトル: ${pageContent.title}
URL: ${pageContent.url}
OGPタイトル: ${pageContent.ogTitle || 'なし'}
OGP説明: ${pageContent.ogDescription || 'なし'}
構造化データ: ${pageContent.jsonLdData ? JSON.stringify(pageContent.jsonLdData) : 'なし'}

ページ本文:
${pageContent.bodyText}

以下の形式でJSONを返してください(他の説明文は不要です):
{
  "title": "展覧会のタイトル",
  "startDate": "YYYY-MM-DD形式の開始日",
  "endDate": "YYYY-MM-DD形式の終了日",
  "location": "開催場所（美術館名など）",
  "description": "展覧会の概要(500文字程度、箇条書き)"
}

注意:
- 日付が見つからない場合は空文字列にしてください
- 複数の展覧会がある場合は、メインと思われるものを1つだけ抽出してください
- JSONのみを返し、マークダウンのコードブロックや説明文は含めないでください
- 開催時刻や休催日がある場合は必ず description に含めてください
`;
  }

  // Parse JSON response from AI
  function parseJsonResponse(content) {
    try {
      return JSON.parse(content);
    } catch (e) {
      // If JSON not found, extract JSON-like portion
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error(chrome.i18n.getMessage('errorParseFailed'));
    }
  }

  // Extract information using Claude API
  async function extractWithClaude(apiKey, pageContent) {
    const prompt = buildPrompt(pageContent);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || chrome.i18n.getMessage('errorApiFailed'));
    }

    const data = await response.json();
    const content = data.content[0].text;

    return parseJsonResponse(content);
  }

  // Extract information using Gemini API
  async function extractWithGemini(apiKey, pageContent) {
    const prompt = buildPrompt(pageContent);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 1024
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || chrome.i18n.getMessage('errorApiFailed'));
    }

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text;

    return parseJsonResponse(content);
  }

  // Generate Google Calendar URL
  function generateGoogleCalendarUrl(eventData) {
    const baseUrl = 'https://calendar.google.com/calendar/render';
    const params = new URLSearchParams();

    params.set('action', 'TEMPLATE');
    params.set('text', eventData.title);

    // Convert dates to Google Calendar format (all-day event)
    if (eventData.startDate) {
      const start = eventData.startDate.replace(/-/g, '');
      let end = start;
      if (eventData.endDate) {
        // Set end date to next day (for all-day events)
        const endDate = new Date(eventData.endDate);
        endDate.setDate(endDate.getDate() + 1);
        end = endDate.toISOString().slice(0, 10).replace(/-/g, '');
      }
      params.set('dates', `${start}/${end}`);
    }

    if (eventData.location) {
      params.set('location', eventData.location);
    }

    // Include URL in description
    let details = eventData.description || '';
    if (eventData.url) {
      details += `\n\n${chrome.i18n.getMessage('details')} ${eventData.url}`;
    }
    if (details) {
      params.set('details', details.trim());
    }

    return `${baseUrl}?${params.toString()}`;
  }

  // Display results
  function displayResult(data, url) {
    titleInput.value = data.title || '';
    startDateInput.value = data.startDate || '';
    endDateInput.value = data.endDate || '';
    locationInput.value = data.location || '';
    descriptionInput.value = data.description || '';
    urlInput.value = url || '';

    resultSection.classList.remove('hidden');
  }

  // Helper functions
  function showLoading(show) {
    if (show) {
      loading.classList.remove('hidden');
      extractBtn.disabled = true;
    } else {
      loading.classList.add('hidden');
      extractBtn.disabled = false;
    }
  }

  function showError(message) {
    error.textContent = message;
    error.classList.remove('hidden');
  }

  function hideError() {
    error.classList.add('hidden');
  }

  function hideResult() {
    resultSection.classList.add('hidden');
  }

  function showMessage(message, isError = true) {
    if (isError) {
      showError(message);
    } else {
      // Success message (simple implementation)
      const originalText = saveApiKeyBtn.textContent;
      saveApiKeyBtn.textContent = '✓';
      setTimeout(() => {
        saveApiKeyBtn.textContent = originalText;
      }, 1500);
    }
  }
});

// Apply i18n translations to elements with data-i18n attribute
function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const messageKey = element.getAttribute('data-i18n');
    const message = chrome.i18n.getMessage(messageKey);
    if (message) {
      element.textContent = message;
    }
  });
}
