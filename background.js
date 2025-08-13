// TreasuryViz Background Script
// Handles data fetching, caching, and background operations

class TreasuryVizBackground {
    constructor() {
        this.cache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
        this.apiEndpoints = {
            treasury: 'https://api.fiscaldata.treasury.gov/api/v1/accounting/od/avg_interest_rates',
            fed: 'https://www.federalreserve.gov/data/YieldCurveModelData.txt',
            fred: 'https://fred.stlouisfed.org/graph/fredgraph.csv'
        };
        
        this.init();
    }

    init() {
        console.log('TreasuryViz background script initialized');
        
        // Set up periodic data refresh
        this.setupAlarms();
        
        // Set up message listeners
        this.setupMessageListeners();
        
        // Initial data fetch
        this.refreshAllData();
    }

    setupAlarms() {
        // Create alarm for periodic data refresh
        chrome.alarms.create('refreshData', {
            delayInMinutes: 1,
            periodInMinutes: 5
        });

        chrome.alarms.onAlarm.addListener((alarm) => {
            if (alarm.name === 'refreshData') {
                this.refreshAllData();
            }
        });
    }

    setupMessageListeners() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            switch (request.action) {
                case 'getBondData':
                    this.getBondData().then(sendResponse);
                    return true; // Keep message channel open for async response
                
                case 'getYieldCurve':
                    this.getYieldCurveData().then(sendResponse);
                    return true;
                
                case 'getEconomicData':
                    this.getEconomicData().then(sendResponse);
                    return true;
                
                case 'refreshData':
                    this.refreshAllData().then(() => {
                        sendResponse({ success: true });
                    });
                    return true;
                
                case 'compareBonds':
                    this.compareBonds(request.bonds).then(sendResponse);
                    return true;
                
                default:
                    sendResponse({ error: 'Unknown action' });
            }
        });
    }

    async refreshAllData() {
        try {
            console.log('Refreshing all TreasuryViz data...');
            
            // Fetch all data types
            await Promise.all([
                this.fetchBondData(),
                this.fetchYieldCurveData(),
                this.fetchEconomicData()
            ]);
            
            console.log('Data refresh completed');
            
            // Notify popup that data has been updated
            this.notifyPopup('dataUpdated');
            
        } catch (error) {
            console.error('Error refreshing data:', error);
        }
    }

    async getBondData() {
        const cacheKey = 'bondData';
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.data;
        }

        const data = await this.fetchBondData();
        return data;
    }

    async fetchBondData() {
        try {
            // Mock data for demonstration - in production, this would fetch from real APIs
            const mockBondData = [
                {
                    symbol: '3M',
                    name: '3 Month Treasury',
                    yield: 5.25,
                    price: 99.85,
                    change: 0.02,
                    maturity: '3M',
                    type: 'Bill'
                },
                {
                    symbol: '6M',
                    name: '6 Month Treasury',
                    yield: 5.15,
                    price: 99.72,
                    change: -0.01,
                    maturity: '6M',
                    type: 'Bill'
                },
                {
                    symbol: '1Y',
                    name: '1 Year Treasury',
                    yield: 4.95,
                    price: 98.95,
                    change: 0.05,
                    maturity: '1Y',
                    type: 'Note'
                },
                {
                    symbol: '2Y',
                    name: '2 Year Treasury',
                    yield: 4.65,
                    price: 97.85,
                    change: -0.03,
                    maturity: '2Y',
                    type: 'Note'
                },
                {
                    symbol: '5Y',
                    name: '5 Year Treasury',
                    yield: 4.25,
                    price: 95.45,
                    change: 0.08,
                    maturity: '5Y',
                    type: 'Note'
                },
                {
                    symbol: '10Y',
                    name: '10 Year Treasury',
                    yield: 4.15,
                    price: 92.85,
                    change: 0.12,
                    maturity: '10Y',
                    type: 'Note'
                },
                {
                    symbol: '30Y',
                    name: '30 Year Treasury',
                    yield: 4.35,
                    price: 88.95,
                    change: -0.05,
                    maturity: '30Y',
                    type: 'Bond'
                }
            ];

            this.cache.set('bondData', {
                data: mockBondData,
                timestamp: Date.now()
            });

            return mockBondData;
        } catch (error) {
            console.error('Error fetching bond data:', error);
            throw error;
        }
    }

    async getYieldCurveData() {
        const cacheKey = 'yieldCurve';
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.data;
        }

        const data = await this.fetchYieldCurveData();
        return data;
    }

    async fetchYieldCurveData() {
        try {
            // Mock yield curve data
            const mockYieldCurve = [
                { maturity: '1M', yield: 5.35 },
                { maturity: '3M', yield: 5.25 },
                { maturity: '6M', yield: 5.15 },
                { maturity: '1Y', yield: 4.95 },
                { maturity: '2Y', yield: 4.65 },
                { maturity: '3Y', yield: 4.45 },
                { maturity: '5Y', yield: 4.25 },
                { maturity: '7Y', yield: 4.18 },
                { maturity: '10Y', yield: 4.15 },
                { maturity: '20Y', yield: 4.28 },
                { maturity: '30Y', yield: 4.35 }
            ];

            this.cache.set('yieldCurve', {
                data: mockYieldCurve,
                timestamp: Date.now()
            });

            return mockYieldCurve;
        } catch (error) {
            console.error('Error fetching yield curve data:', error);
            throw error;
        }
    }

    async getEconomicData() {
        const cacheKey = 'economicData';
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.data;
        }

        const data = await this.fetchEconomicData();
        return data;
    }

    async fetchEconomicData() {
        try {
            // Mock economic data
            const mockEconomicData = {
                inflation: 3.2,
                fedFundsRate: 5.25,
                unemployment: 3.8,
                gdpGrowth: 2.1,
                lastUpdated: new Date().toISOString()
            };

            this.cache.set('economicData', {
                data: mockEconomicData,
                timestamp: Date.now()
            });

            return mockEconomicData;
        } catch (error) {
            console.error('Error fetching economic data:', error);
            throw error;
        }
    }

    async compareBonds(bonds) {
        try {
            const bondData = await this.getBondData();
            const bond1 = bondData.find(b => b.symbol === bonds.bond1);
            const bond2 = bondData.find(b => b.symbol === bonds.bond2);

            if (!bond1 || !bond2) {
                throw new Error('One or both bonds not found');
            }

            const comparison = {
                bond1: {
                    symbol: bond1.symbol,
                    name: bond1.name,
                    yield: bond1.yield,
                    duration: this.calculateDuration(bond1.maturity),
                    risk: this.assessRisk(bond1)
                },
                bond2: {
                    symbol: bond2.symbol,
                    name: bond2.name,
                    yield: bond2.yield,
                    duration: this.calculateDuration(bond2.maturity),
                    risk: this.assessRisk(bond2)
                },
                differences: {
                    yield: bond1.yield - bond2.yield,
                    duration: this.calculateDuration(bond1.maturity) - this.calculateDuration(bond2.maturity)
                }
            };

            return comparison;
        } catch (error) {
            console.error('Error comparing bonds:', error);
            throw error;
        }
    }

    calculateDuration(maturity) {
        // Simple duration calculation based on maturity
        const maturityMap = {
            '3M': 0.25,
            '6M': 0.5,
            '1Y': 1.0,
            '2Y': 1.9,
            '3Y': 2.8,
            '5Y': 4.5,
            '7Y': 6.2,
            '10Y': 8.2,
            '20Y': 15.5,
            '30Y': 22.7
        };
        return maturityMap[maturity] || 1.0;
    }

    assessRisk(bond) {
        // Simple risk assessment based on maturity and type
        const maturityYears = this.calculateDuration(bond.maturity);
        if (maturityYears < 1) return 'Very Low';
        if (maturityYears < 3) return 'Low';
        if (maturityYears < 7) return 'Medium';
        if (maturityYears < 15) return 'High';
        return 'Very High';
    }

    notifyPopup(message) {
        // Send message to popup if it's open
        chrome.runtime.sendMessage({ action: message }).catch(() => {
            // Popup might not be open, ignore error
        });
    }

    // Utility methods
    generatePerformanceData() {
        // Generate mock performance data for charts
        const data = [];
        const baseValue = 100;
        let currentValue = baseValue;
        
        for (let i = 0; i < 24; i++) {
            const change = (Math.random() - 0.5) * 2;
            currentValue += change;
            data.push({
                hour: i,
                value: currentValue
            });
        }
        
        return data;
    }
}

// Initialize the background script
const treasuryViz = new TreasuryVizBackground();

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TreasuryVizBackground;
}