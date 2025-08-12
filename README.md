# TreasuryViz-us-Bond-Analysis
Professional US Treasury bond analysis extension tool with real-time yields, yield curve visualization, and comparison features
# TreasuryViz Firefox Extension - Complete Package Guide

## 📁 Extension Structure

```
treasury-viz-extension/
├── manifest.json          # Extension manifest file
├── popup.html            # Main popup interface
├── options.html          # Settings page
├── icons/                # Extension icons
│   ├── icon-16.png
│   ├── icon-32.png
│   ├── icon-48.png
│   ├── icon-96.png
│   └── icon-128.png
├── css/                  # Stylesheets
│   ├── popup.css        # Popup styles
│   ├── content.css      # Content script styles
│   └── settings.css     # Settings page styles
└── js/                   # JavaScript files
    ├── background.js     # Background service worker
    ├── popup.js         # Popup interface logic
    ├── content.js       # Page interaction scripts
    └── settings.js      # Settings page logic
```

## 🚀 How to Install & Use

### Method 1: Developer Installation (For Testing)

1. **Open Firefox**
   - Launch Firefox browser

go to extension tool and type TreasuryViz ( coming soon )

## 🎯 How to Use TreasuryViz

### After Installation:

1. **Access the Extension**
   - Look for the TreasuryViz icon (TV) in your Firefox toolbar
   - Click the icon to open the popup

2. **Navigate Features**
   - **Dashboard**: View real-time Treasury bond data and economic indicators
   - **Yield Curve**: Interactive yield curve visualization
   - **Comparison**: Compare different Treasury bonds side-by-side
   - **About**: Extension information and support

3. **Customize Settings**
   - Right-click the extension icon
   - Select "Options" to open settings
   - Configure refresh intervals, themes, data sources, and more

## 📋 Features Overview

### 🏠 Dashboard
- Real-time Treasury bond yields and prices
- Interactive bond selector (3M to 30Y maturities)
- Performance charts
- Economic indicators (Inflation, Fed Rate, Unemployment)
- Risk metrics and analysis

### 📈 Yield Curve
- Interactive yield curve visualization
- Multiple time ranges (1D to 1Y)
- Curve analysis and insights
- 10Y-2Y spread tracking

### ⚖️ Comparison Tool
- Side-by-side bond comparison
- Yield, duration, and risk analysis
- Visual difference indicators
- Comprehensive metrics table

### 🌐 Page Integration
- Automatic financial term highlighting on compatible sites
- Context-aware widgets on financial news sites
- Real-time data overlays
- Educational tooltips

## 🔧 Technical Requirements

### Browser Compatibility
- **Firefox**: Version 100.0 or higher
- **Manifest Version**: 3

### Permissions Required
- `storage`: Save user preferences and cache data
- `activeTab`: Access current tab for content scripts
- `alarms`: Schedule periodic data refresh
- Host permissions for Treasury.gov, Federal Reserve, and FRED APIs

## 🛠️ Development & Customization


## 🐛 Troubleshooting

### Common Issues:

**Extension doesn't load:**
- Check that `manifest.json` is valid JSON
- Verify all file paths are correct
- Ensure Firefox version is 100.0 or higher

**Data not refreshing:**
- Check internet connection
- Verify API endpoints are accessible
- Review background script for errors

**Styles not applying:**
- Check CSS file paths in HTML files
- Verify CSS syntax is correct
- Check for conflicting styles

## 📞 Support

### For Support:
- **Email**: tamiusobserver@gmail.com
- **Issues**: Report bugs through Firefox Add-ons store
- **Documentation**: Built-in help in extension about section

### Feature Requests:
We welcome suggestions for new features and improvements. Please contact us with your ideas!

## 🔄 Updates

### Automatic Updates:
- Firefox will automatically update your extension when i publish new version

Development Status: Please note, this version currently uses mock/sample data for demonstration purposes. All front-end features, including the dashboard, charting, and comparison tools, are fully implemented. The next development phase is to integrate live data from the Treasury and FRED APIs.

---
