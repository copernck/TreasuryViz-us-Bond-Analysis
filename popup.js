// TreasuryViz Popup Script
// Handles the popup interface and user interactions

class TreasuryVizPopup {
    constructor() {
        this.currentTab = 'dashboard';
        this.bondData = null;
        this.yieldCurveData = null;
        this.economicData = null;
        
        this.init();
    }

    init() {
        console.log('TreasuryViz popup initialized');
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Load initial data
        this.loadInitialData();
        
        // Initialize charts
        this.initCharts();
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Bond selector
        const bondSelect = document.getElementById('bondSelect');
        if (bondSelect) {
            bondSelect.addEventListener('change', (e) => {
                this.updateBondDisplay(e.target.value);
            });
        }

        // Time range selector
        const timeRange = document.getElementById('timeRange');
        if (timeRange) {
            timeRange.addEventListener('change', (e) => {
                this.updateYieldCurve(e.target.value);
            });
        }

        // Bond comparison selectors
        const bond1Select = document.getElementById('bond1Select');
        const bond2Select = document.getElementById('bond2Select');
        
        if (bond1Select && bond2Select) {
            bond1Select.addEventListener('change', () => {
                this.updateComparison();
            });
            bond2Select.addEventListener('change', () => {
                this.updateComparison();
            });
        }

        // Action buttons
        const refreshBtn = document.getElementById('refreshBtn');
        const expandBtn = document.getElementById('expandBtn');
        const settingsBtn = document.getElementById('settingsBtn');

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshData();
            });
        }

        if (expandBtn) {
            expandBtn.addEventListener('click', () => {
                this.openFullView();
            });
        }

        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.openSettings();
            });
        }
    }

    async loadInitialData() {
        try {
            // Load all data in parallel
            const [bondData, yieldCurveData, economicData] = await Promise.all([
                this.sendMessage({ action: 'getBondData' }),
                this.sendMessage({ action: 'getYieldCurve' }),
                this.sendMessage({ action: 'getEconomicData' })
            ]);

            this.bondData = bondData;
            this.yieldCurveData = yieldCurveData;
            this.economicData = economicData;

            // Update displays
            this.updateBondDisplay('10Y');
            this.updateYieldCurve('1M');
            this.updateComparison();
            this.updateEconomicIndicators();

        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showError('Failed to load data');
        }
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab panels
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        this.currentTab = tabName;

        // Refresh data when switching to specific tabs
        if (tabName === 'yield-curve') {
            this.updateYieldCurve('1M');
        } else if (tabName === 'comparison') {
            this.updateComparison();
        }
    }

    updateBondDisplay(bondSymbol) {
        if (!this.bondData) return;

        const bond = this.bondData.find(b => b.symbol === bondSymbol);
        if (!bond) return;

        // Update bond information
        const bondName = document.getElementById('bondName');
        const bondYield = document.getElementById('bondYield');
        const bondPrice = document.getElementById('bondPrice');
        const bondMaturity = document.getElementById('bondMaturity');
        const bondChange = document.getElementById('bondChange');

        if (bondName) bondName.textContent = bond.name;
        if (bondYield) bondYield.textContent = `${bond.yield.toFixed(2)}%`;
        if (bondPrice) bondPrice.textContent = `$${bond.price.toFixed(2)}`;
        if (bondMaturity) bondMaturity.textContent = bond.maturity;
        
        if (bondChange) {
            bondChange.textContent = `${bond.change >= 0 ? '+' : ''}${bond.change}%`;
            bondChange.className = `change ${bond.change >= 0 ? 'positive' : 'negative'}`;
        }

        // Update performance chart
        this.updatePerformanceChart(bondSymbol);
    }

    updateYieldCurve(timeRange) {
        if (!this.yieldCurveData) return;

        // Update yield curve chart
        this.drawYieldCurve(this.yieldCurveData);
    }

    updateComparison() {
        if (!this.bondData) return;

        const bond1Select = document.getElementById('bond1Select');
        const bond2Select = document.getElementById('bond2Select');

        if (!bond1Select || !bond2Select) return;

        const bond1Symbol = bond1Select.value;
        const bond2Symbol = bond2Select.value;

        const bond1 = this.bondData.find(b => b.symbol === bond1Symbol);
        const bond2 = this.bondData.find(b => b.symbol === bond2Symbol);

        if (!bond1 || !bond2) return;

        // Update comparison table
        const bond1Yield = document.getElementById('bond1Yield');
        const bond2Yield = document.getElementById('bond2Yield');
        const yieldDiff = document.getElementById('yieldDiff');

        const bond1Duration = document.getElementById('bond1Duration');
        const bond2Duration = document.getElementById('bond2Duration');
        const durationDiff = document.getElementById('durationDiff');

        const bond1Risk = document.getElementById('bond1Risk');
        const bond2Risk = document.getElementById('bond2Risk');

        if (bond1Yield) bond1Yield.textContent = `${bond1.yield.toFixed(2)}%`;
        if (bond2Yield) bond2Yield.textContent = `${bond2.yield.toFixed(2)}%`;
        
        if (yieldDiff) {
            const diff = bond1.yield - bond2.yield;
            yieldDiff.textContent = `${diff >= 0 ? '+' : ''}${diff.toFixed(2)}%`;
            yieldDiff.className = diff >= 0 ? 'positive' : 'negative';
        }

        const duration1 = this.calculateDuration(bond1.maturity);
        const duration2 = this.calculateDuration(bond2.maturity);

        if (bond1Duration) bond1Duration.textContent = `${duration1.toFixed(1)}y`;
        if (bond2Duration) bond2Duration.textContent = `${duration2.toFixed(1)}y`;
        
        if (durationDiff) {
            const diff = duration1 - duration2;
            durationDiff.textContent = `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}y`;
            durationDiff.className = diff >= 0 ? 'positive' : 'negative';
        }

        if (bond1Risk) bond1Risk.textContent = this.assessRisk(bond1);
        if (bond2Risk) bond2Risk.textContent = this.assessRisk(bond2);
    }

    updateEconomicIndicators() {
        if (!this.economicData) return;

        // Update quick stats in dashboard
        const stats = document.querySelectorAll('.stat-value');
        if (stats.length >= 3) {
            stats[0].textContent = `${this.economicData.inflation.toFixed(1)}%`;
            stats[1].textContent = `${this.economicData.fedFundsRate.toFixed(2)}%`;
            
            // Calculate 10Y-2Y spread
            const bond10Y = this.bondData?.find(b => b.symbol === '10Y');
            const bond2Y = this.bondData?.find(b => b.symbol === '2Y');
            if (bond10Y && bond2Y) {
                const spread = bond10Y.yield - bond2Y.yield;
                stats[2].textContent = `${spread >= 0 ? '+' : ''}${spread.toFixed(2)}%`;
            }
        }
    }

    initCharts() {
        // Initialize performance chart
        this.initPerformanceChart();
        
        // Initialize yield curve chart
        this.initYieldCurveChart();
    }

    initPerformanceChart() {
        const canvas = document.getElementById('performanceChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw grid
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        
        for (let i = 0; i <= 4; i++) {
            const y = (height / 4) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Draw sample performance line
        ctx.strokeStyle = '#1e40af';
        ctx.lineWidth = 2;
        ctx.beginPath();

        const data = this.generatePerformanceData();
        data.forEach((point, index) => {
            const x = (width / (data.length - 1)) * index;
            const y = height - ((point.value - 95) / 10) * height;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();
    }

    initYieldCurveChart() {
        const canvas = document.getElementById('yieldCurveChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw axes
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1;
        
        // Y-axis
        ctx.beginPath();
        ctx.moveTo(30, 10);
        ctx.lineTo(30, height - 30);
        ctx.stroke();
        
        // X-axis
        ctx.beginPath();
        ctx.moveTo(30, height - 30);
        ctx.lineTo(width - 10, height - 30);
        ctx.stroke();
    }

    updatePerformanceChart(bondSymbol) {
        // Regenerate performance chart with new data
        this.initPerformanceChart();
    }

    drawYieldCurve(data) {
        const canvas = document.getElementById('yieldCurveChart');
        if (!canvas || !data) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw axes
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1;
        
        // Y-axis
        ctx.beginPath();
        ctx.moveTo(30, 10);
        ctx.lineTo(30, height - 30);
        ctx.stroke();
        
        // X-axis
        ctx.beginPath();
        ctx.moveTo(30, height - 30);
        ctx.lineTo(width - 10, height - 30);
        ctx.stroke();

        // Draw yield curve
        ctx.strokeStyle = '#1e40af';
        ctx.lineWidth = 3;
        ctx.beginPath();

        data.forEach((point, index) => {
            const x = 30 + ((width - 40) / (data.length - 1)) * index;
            const y = height - 30 - ((point.yield / 6) * (height - 40));
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Draw data points
        ctx.fillStyle = '#1e40af';
        data.forEach((point, index) => {
            const x = 30 + ((width - 40) / (data.length - 1)) * index;
            const y = height - 30 - ((point.yield / 6) * (height - 40));
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        });

        // Draw labels
        ctx.fillStyle = '#64748b';
        ctx.font = '10px Inter';
        ctx.textAlign = 'center';

        data.forEach((point, index) => {
            if (index % 2 === 0) { // Show every other label to avoid crowding
                const x = 30 + ((width - 40) / (data.length - 1)) * index;
                ctx.fillText(point.maturity, x, height - 15);
            }
        });
    }

    async refreshData() {
        try {
            const refreshBtn = document.getElementById('refreshBtn');
            if (refreshBtn) {
                refreshBtn.style.transform = 'rotate(360deg)';
                refreshBtn.style.transition = 'transform 0.5s';
            }

            await this.sendMessage({ action: 'refreshData' });
            await this.loadInitialData();

            // Reset button rotation
            setTimeout(() => {
                if (refreshBtn) {
                    refreshBtn.style.transform = 'rotate(0deg)';
                }
            }, 500);

            this.showSuccess('Data refreshed successfully');

        } catch (error) {
            console.error('Error refreshing data:', error);
            this.showError('Failed to refresh data');
        }
    }

    openFullView() {
        // Open the full dashboard in a new tab
        chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
    }

    openSettings() {
        // Open settings page
        chrome.runtime.openOptionsPage();
    }

    // Utility methods
    sendMessage(message) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(message, (response) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else if (response && response.error) {
                    reject(new Error(response.error));
                } else {
                    resolve(response);
                }
            });
        });
    }

    calculateDuration(maturity) {
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
        const maturityYears = this.calculateDuration(bond.maturity);
        if (maturityYears < 1) return 'Very Low';
        if (maturityYears < 3) return 'Low';
        if (maturityYears < 7) return 'Medium';
        if (maturityYears < 15) return 'High';
        return 'Very High';
    }

    generatePerformanceData() {
        const data = [];
        let currentValue = 100;
        
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

    showSuccess(message) {
        // Show success notification (could be enhanced with a toast system)
        console.log('Success:', message);
    }

    showError(message) {
        // Show error notification
        console.error('Error:', message);
        alert(message); // Simple alert for now
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const treasuryViz = new TreasuryVizPopup();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TreasuryVizPopup;
}