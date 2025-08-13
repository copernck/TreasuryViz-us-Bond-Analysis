// TreasuryViz Settings Page Script
// Handles settings management and user preferences

class TreasuryVizSettings {
    constructor() {
        this.defaultSettings = {
            refreshInterval: 5,
            defaultBond: '10Y',
            theme: 'light',
            useTreasuryAPI: true,
            useFedData: true,
            useFredData: true,
            showAnimations: true,
            showNotifications: true,
            highlightTerms: true,
            showWidget: false,
            apiTimeout: 30,
            cacheDuration: 5,
            debugMode: false
        };

        this.currentSettings = { ...this.defaultSettings };
        
        this.init();
    }

    init() {
        console.log('TreasuryViz settings page initialized');
        
        // Load saved settings
        this.loadSettings();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Apply settings to UI
        this.applySettingsToUI();
    }

    setupEventListeners() {
        // Save settings button
        const saveBtn = document.getElementById('saveSettings');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveSettings();
            });
        }

        // Reset settings button
        const resetBtn = document.getElementById('resetSettings');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetSettings();
            });
        }

        // Clear cache button
        const clearCacheBtn = document.getElementById('clearCache');
        if (clearCacheBtn) {
            clearCacheBtn.addEventListener('click', () => {
                this.clearCache();
            });
        }

        // Listen for settings changes
        this.setupSettingsListeners();
    }

    setupSettingsListeners() {
        // General settings
        const refreshInterval = document.getElementById('refreshInterval');
        const defaultBond = document.getElementById('defaultBond');
        const theme = document.getElementById('theme');

        if (refreshInterval) {
            refreshInterval.addEventListener('change', (e) => {
                this.currentSettings.refreshInterval = parseInt(e.target.value);
            });
        }

        if (defaultBond) {
            defaultBond.addEventListener('change', (e) => {
                this.currentSettings.defaultBond = e.target.value;
            });
        }

        if (theme) {
            theme.addEventListener('change', (e) => {
                this.currentSettings.theme = e.target.value;
                this.applyTheme(e.target.value);
            });
        }

        // Data sources
        const useTreasuryAPI = document.getElementById('useTreasuryAPI');
        const useFedData = document.getElementById('useFedData');
        const useFredData = document.getElementById('useFredData');

        if (useTreasuryAPI) {
            useTreasuryAPI.addEventListener('change', (e) => {
                this.currentSettings.useTreasuryAPI = e.target.checked;
            });
        }

        if (useFedData) {
            useFedData.addEventListener('change', (e) => {
                this.currentSettings.useFedData = e.target.checked;
            });
        }

        if (useFredData) {
            useFredData.addEventListener('change', (e) => {
                this.currentSettings.useFredData = e.target.checked;
            });
        }

        // Display options
        const showAnimations = document.getElementById('showAnimations');
        const showNotifications = document.getElementById('showNotifications');
        const highlightTerms = document.getElementById('highlightTerms');
        const showWidget = document.getElementById('showWidget');

        if (showAnimations) {
            showAnimations.addEventListener('change', (e) => {
                this.currentSettings.showAnimations = e.target.checked;
            });
        }

        if (showNotifications) {
            showNotifications.addEventListener('change', (e) => {
                this.currentSettings.showNotifications = e.target.checked;
            });
        }

        if (highlightTerms) {
            highlightTerms.addEventListener('change', (e) => {
                this.currentSettings.highlightTerms = e.target.checked;
            });
        }

        if (showWidget) {
            showWidget.addEventListener('change', (e) => {
                this.currentSettings.showWidget = e.target.checked;
            });
        }

        // Advanced settings
        const apiTimeout = document.getElementById('apiTimeout');
        const cacheDuration = document.getElementById('cacheDuration');
        const debugMode = document.getElementById('debugMode');

        if (apiTimeout) {
            apiTimeout.addEventListener('change', (e) => {
                this.currentSettings.apiTimeout = parseInt(e.target.value);
            });
        }

        if (cacheDuration) {
            cacheDuration.addEventListener('change', (e) => {
                this.currentSettings.cacheDuration = parseInt(e.target.value);
            });
        }

        if (debugMode) {
            debugMode.addEventListener('change', (e) => {
                this.currentSettings.debugMode = e.target.checked;
                this.toggleDebugMode(e.target.checked);
            });
        }
    }

    async loadSettings() {
        try {
            // Load settings from chrome.storage
            const result = await this.getStorageData('treasuryVizSettings');
            
            if (result && result.treasuryVizSettings) {
                this.currentSettings = { ...this.defaultSettings, ...result.treasuryVizSettings };
            }

            console.log('Settings loaded:', this.currentSettings);
            
        } catch (error) {
            console.error('Error loading settings:', error);
            this.showMessage('Error loading settings', 'error');
        }
    }

    async saveSettings() {
        try {
            // Save settings to chrome.storage
            await this.setStorageData({ treasuryVizSettings: this.currentSettings });

            // Notify background script of settings changes
            await this.notifyBackgroundScript('settingsUpdated', this.currentSettings);

            console.log('Settings saved:', this.currentSettings);
            this.showMessage('Settings saved successfully!', 'success');

            // Apply theme immediately
            this.applyTheme(this.currentSettings.theme);

        } catch (error) {
            console.error('Error saving settings:', error);
            this.showMessage('Error saving settings', 'error');
        }
    }

    async resetSettings() {
        if (confirm('Are you sure you want to reset all settings to defaults?')) {
            try {
                this.currentSettings = { ...this.defaultSettings };
                
                // Reset UI elements
                this.applySettingsToUI();
                
                // Save the reset settings
                await this.saveSettings();
                
                this.showMessage('Settings reset to defaults', 'success');

            } catch (error) {
                console.error('Error resetting settings:', error);
                this.showMessage('Error resetting settings', 'error');
            }
        }
    }

    async clearCache() {
        if (confirm('Are you sure you want to clear all cached data?')) {
            try {
                // Clear extension storage
                await this.clearStorageData();
                
                // Notify background script to clear cache
                await this.notifyBackgroundScript('clearCache');
                
                this.showMessage('Cache cleared successfully', 'success');

            } catch (error) {
                console.error('Error clearing cache:', error);
                this.showMessage('Error clearing cache', 'error');
            }
        }
    }

    applySettingsToUI() {
        // General settings
        const refreshInterval = document.getElementById('refreshInterval');
        const defaultBond = document.getElementById('defaultBond');
        const theme = document.getElementById('theme');

        if (refreshInterval) refreshInterval.value = this.currentSettings.refreshInterval;
        if (defaultBond) defaultBond.value = this.currentSettings.defaultBond;
        if (theme) theme.value = this.currentSettings.theme;

        // Data sources
        const useTreasuryAPI = document.getElementById('useTreasuryAPI');
        const useFedData = document.getElementById('useFedData');
        const useFredData = document.getElementById('useFredData');

        if (useTreasuryAPI) useTreasuryAPI.checked = this.currentSettings.useTreasuryAPI;
        if (useFedData) useFedData.checked = this.currentSettings.useFedData;
        if (useFredData) useFredData.checked = this.currentSettings.useFredData;

        // Display options
        const showAnimations = document.getElementById('showAnimations');
        const showNotifications = document.getElementById('showNotifications');
        const highlightTerms = document.getElementById('highlightTerms');
        const showWidget = document.getElementById('showWidget');

        if (showAnimations) showAnimations.checked = this.currentSettings.showAnimations;
        if (showNotifications) showNotifications.checked = this.currentSettings.showNotifications;
        if (highlightTerms) highlightTerms.checked = this.currentSettings.highlightTerms;
        if (showWidget) showWidget.checked = this.currentSettings.showWidget;

        // Advanced settings
        const apiTimeout = document.getElementById('apiTimeout');
        const cacheDuration = document.getElementById('cacheDuration');
        const debugMode = document.getElementById('debugMode');

        if (apiTimeout) apiTimeout.value = this.currentSettings.apiTimeout;
        if (cacheDuration) cacheDuration.value = this.currentSettings.cacheDuration;
        if (debugMode) debugMode.checked = this.currentSettings.debugMode;

        // Apply theme
        this.applyTheme(this.currentSettings.theme);
    }

    applyTheme(theme) {
        const body = document.body;
        
        // Remove existing theme classes
        body.classList.remove('theme-light', 'theme-dark');
        
        // Apply new theme
        if (theme === 'dark') {
            body.classList.add('theme-dark');
        } else if (theme === 'light') {
            body.classList.add('theme-light');
        }
        
        // For auto theme, you could implement system preference detection
        if (theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            body.classList.add(prefersDark ? 'theme-dark' : 'theme-light');
        }
    }

    toggleDebugMode(enabled) {
        if (enabled) {
            console.log('Debug mode enabled');
            // Add debug visual indicators
            document.body.classList.add('debug-mode');
        } else {
            console.log('Debug mode disabled');
            document.body.classList.remove('debug-mode');
        }
    }

    showMessage(text, type = 'success') {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());

        // Create new message
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;

        // Insert after header
        const header = document.querySelector('.settings-header');
        if (header) {
            header.parentNode.insertBefore(message, header.nextSibling);
        }

        // Show message
        setTimeout(() => {
            message.classList.add('show');
        }, 100);

        // Auto-hide after 3 seconds
        setTimeout(() => {
            message.classList.remove('show');
            setTimeout(() => {
                if (message.parentNode) {
                    message.parentNode.removeChild(message);
                }
            }, 300);
        }, 3000);
    }

    // Chrome Storage API helpers
    getStorageData(key) {
        return new Promise((resolve) => {
            chrome.storage.sync.get(key, (result) => {
                resolve(result);
            });
        });
    }

    setStorageData(data) {
        return new Promise((resolve) => {
            chrome.storage.sync.set(data, () => {
                resolve();
            });
        });
    }

    clearStorageData() {
        return new Promise((resolve) => {
            chrome.storage.sync.clear(() => {
                resolve();
            });
        });
    }

    // Background script communication
    async notifyBackgroundScript(action, data = null) {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage({ action, data }, (response) => {
                resolve(response);
            });
        });
    }

    // Export settings for backup
    exportSettings() {
        const dataStr = JSON.stringify(this.currentSettings, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'treasuryviz-settings.json';
        link.click();
        
        URL.revokeObjectURL(url);
    }

    // Import settings from backup
    importSettings(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedSettings = JSON.parse(e.target.result);
                    this.currentSettings = { ...this.defaultSettings, ...importedSettings };
                    this.applySettingsToUI();
                    resolve();
                } catch (error) {
                    reject(new Error('Invalid settings file'));
                }
            };
            reader.onerror = () => reject(new Error('Error reading file'));
            reader.readAsText(file);
        });
    }
}

// Initialize settings page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const treasuryVizSettings = new TreasuryVizSettings();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TreasuryVizSettings;
}