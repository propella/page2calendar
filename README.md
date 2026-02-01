# Page to Calendar - Chrome Extension

[日本語](README.ja.md)

A Chrome extension that extracts event information from web pages (such as art exhibitions) using Claude AI and adds them to Google Calendar.

## Features

- Claude AI analyzes page content and extracts event info (title, dates, location, description)
- Extracted results are editable
- One-click registration to Google Calendar

## Requirements

- Google Chrome browser
- Gemini or Claude API Key
    - Gemini API Key ([API keys | Google AI Studio](https://aistudio.google.com/app/api-keys))
    - Claude API Key（[Anthropic Console](https://console.anthropic.com/)）

## Installation

1. Download or clone this folder
2. Open `chrome://extensions` in Chrome
3. Enable "Developer mode" in the top right
4. Click "Load unpacked"
5. Select the `page2calendar` folder
6. The extension will be installed and the icon will appear in the toolbar

## Usage

1. Open a web page with event information (e.g., art exhibition page)
2. Click the extension icon in the toolbar
3. First time only: Enter your Claude API key and click "Save"
4. Click "Extract Info" button
5. Review and edit the extracted information if needed
6. Click "Add to Google Calendar"
7. Google Calendar opens with the event creation form

## File Structure

```
page2calendar/
├── manifest.json   # Extension configuration
├── popup.html      # Popup UI
├── popup.js        # Main logic
├── content.js      # Page content extraction
├── styles.css      # Styles
├── _locales/       # i18n translations
├── icons/          # Icons
└── README.md
```

## Notes

- API key is stored in browser's local storage
- Claude API usage may incur charges
- Extraction accuracy varies depending on page structure. Always verify the results

## Troubleshooting

**"Extract Info" doesn't work**
- Verify your API key is entered correctly
- Wait for the page to fully load before extracting

**Extraction results are incorrect**
- You can manually edit the form fields
- Use YYYY-MM-DD format for dates

## License

MIT License

## Privacy Policy

See [PRIVACY_POLICY.md](PRIVACY_POLICY.md) for details.
