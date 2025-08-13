// TreasuryViz Content Script
// Handles page interactions and content injection

class TreasuryVizContent {
    constructor() {
        this.enabled = true;
        this.highlights = [];
        this.init();
    }

    init() {
        console.log('TreasuryViz content script initialized');
        
        // Set up message listeners
        this.setupMessageListeners();
        
        // Check if we should enable features on this page
        this.checkPageCompatibility();
        
        // Initialize page features
        this.initializeFeatures();
    }

    setupMessageListeners() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            switch (request.action) {
                case 'highlightTerms':
                    this.highlightFinancialTerms(request.terms);
                    sendResponse({ success: true });
                    break;
                
                case 'removeHighlights':
                    this.removeHighlights();
                    sendResponse({ success: true });
                    break;
                
                case 'injectWidget':
                    this.injectWidget(request.widget);
                    sendResponse({ success: true });
                    break;
                
                case 'removeWidget':
                    this.removeWidget();
                    sendResponse({ success: true });
                    break;
                
                case 'getPageData':
                    const pageData = this.extractFinancialData();
                    sendResponse(pageData);
                    break;
                
                default:
                    sendResponse({ error: 'Unknown action' });
            }
        });
    }

    checkPageCompatibility() {
        const url = window.location.href;
        
        // Enable features on financial news sites, government sites, etc.
        const compatibleSites = [
            'bloomberg.com',
            'reuters.com',
            'wsj.com',
            'financialtimes.com',
            'cnbc.com',
            'treasury.gov',
            'federalreserve.gov',
            'fred.stlouisfed.org'
        ];

        this.enabled = compatibleSites.some(site => url.includes(site));
        
        if (this.enabled) {
            console.log('TreasuryViz features enabled for this page');
        }
    }

    initializeFeatures() {
        if (!this.enabled) return;

        // Add context menu for financial terms
        this.addContextMenuFeatures();
        
        // Monitor for financial content
        this.monitorFinancialContent();
        
        // Add page-level enhancements
        this.enhanceFinancialPages();
    }

    addContextMenuFeatures() {
        // Add right-click context menu for financial terms
        document.addEventListener('contextmenu', (e) => {
            const selection = window.getSelection();
            const selectedText = selection.toString().trim();
            
            if (this.isFinancialTerm(selectedText)) {
                // Store selected term for potential use
                this.lastSelectedTerm = selectedText;
            }
        });
    }

    monitorFinancialContent() {
        // Monitor page for financial terms and data
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.TEXT_NODE) {
                            this.checkTextNode(node);
                        } else if (node.nodeType === Node.ELEMENT_NODE) {
                            this.checkElementNode(node);
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });

        this.observer = observer;
    }

    enhanceFinancialPages() {
        // Add enhancements to financial pages
        if (this.isTreasuryPage()) {
            this.addTreasuryEnhancements();
        } else if (this.isFinancialNewsPage()) {
            this.addNewsEnhancements();
        }
    }

    isFinancialTerm(text) {
        const financialTerms = [
            'treasury', 'bond', 'yield', 'coupon', 'maturity', 'duration',
            'inflation', 'fed', 'interest rate', 'treasury bill', 'treasury note',
            'treasury bond', 'T-bill', 'T-note', 'T-bond', 'yield curve',
            'spread', 'basis point', 'duration', 'convexity'
        ];

        return financialTerms.some(term => 
            text.toLowerCase().includes(term.toLowerCase())
        );
    }

    checkTextNode(node) {
        const text = node.textContent;
        if (this.isFinancialTerm(text)) {
            this.highlightFinancialTerm(node);
        }
    }

    checkElementNode(element) {
        const text = element.textContent;
        if (this.isFinancialTerm(text)) {
            this.highlightFinancialTerm(element);
        }
    }

    highlightFinancialTerm(node) {
        // Simple highlighting - in production, this would be more sophisticated
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent;
            const highlightedText = this.wrapFinancialTerms(text);
            
            if (highlightedText !== text) {
                const wrapper = document.createElement('span');
                wrapper.innerHTML = highlightedText;
                node.parentNode.replaceChild(wrapper, node);
            }
        }
    }

    wrapFinancialTerms(text) {
        const terms = [
            { term: 'treasury', class: 'treasury-term' },
            { term: 'bond', class: 'bond-term' },
            { term: 'yield', class: 'yield-term' },
            { term: 'inflation', class: 'inflation-term' },
            { term: 'fed', class: 'fed-term' }
        ];

        let result = text;
        terms.forEach(({ term, class: className }) => {
            const regex = new RegExp(`\\b${term}\\b`, 'gi');
            result = result.replace(regex, `<span class="treasuryviz-highlight ${className}">${term}</span>`);
        });

        return result;
    }

    highlightFinancialTerms(terms) {
        // Remove existing highlights
        this.removeHighlights();

        // Add new highlights
        terms.forEach(term => {
            const walker = document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );

            const textNodes = [];
            let node;
            while (node = walker.nextNode()) {
                textNodes.push(node);
            }

            textNodes.forEach(textNode => {
                const text = textNode.textContent;
                if (text.toLowerCase().includes(term.toLowerCase())) {
                    this.highlightTerm(textNode, term);
                }
            });
        });
    }

    highlightTerm(textNode, term) {
        const text = textNode.textContent;
        const regex = new RegExp(`(${term})`, 'gi');
        const parts = text.split(regex);

        if (parts.length > 1) {
            const fragment = document.createDocumentFragment();
            parts.forEach(part => {
                if (part.toLowerCase() === term.toLowerCase()) {
                    const span = document.createElement('span');
                    span.className = 'treasuryviz-highlight';
                    span.style.backgroundColor = '#fef3c7';
                    span.style.padding = '2px 4px';
                    span.style.borderRadius = '3px';
                    span.style.cursor = 'pointer';
                    span.title = `Click for more info about ${part}`;
                    span.addEventListener('click', () => {
                        this.showTermInfo(part);
                    });
                    fragment.appendChild(span);
                } else {
                    fragment.appendChild(document.createTextNode(part));
                }
            });

            textNode.parentNode.replaceChild(fragment, textNode);
            this.highlights.push(fragment);
        }
    }

    removeHighlights() {
        this.highlights.forEach(highlight => {
            const parent = highlight.parentNode;
            if (parent) {
                while (highlight.firstChild) {
                    parent.insertBefore(highlight.firstChild, highlight);
                }
                parent.removeChild(highlight);
            }
        });
        this.highlights = [];
    }

    showTermInfo(term) {
        // Show information about the financial term
        const termInfo = this.getTermInfo(term);
        
        // Create and show tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'treasuryviz-tooltip';
        tooltip.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            max-width: 300px;
        `;

        tooltip.innerHTML = `
            <h3 style="margin: 0 0 8px 0; color: #1f2937;">${term}</h3>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">${termInfo.description}</p>
            <button style="
                margin-top: 12px;
                padding: 6px 12px;
                background: #1f2937;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
            ">Close</button>
        `;

        document.body.appendChild(tooltip);

        // Close button functionality
        tooltip.querySelector('button').addEventListener('click', () => {
            document.body.removeChild(tooltip);
        });

        // Close on outside click
        setTimeout(() => {
            document.addEventListener('click', function closeTooltip(e) {
                if (!tooltip.contains(e.target)) {
                    document.body.removeChild(tooltip);
                    document.removeEventListener('click', closeTooltip);
                }
            });
        }, 100);
    }

    getTermInfo(term) {
        const termDatabase = {
            'treasury': {
                description: 'U.S. Treasury securities are government debt instruments issued to finance government spending.'
            },
            'bond': {
                description: 'A bond is a fixed income instrument that represents a loan made by an investor to a borrower.'
            },
            'yield': {
                description: 'Yield is the income returned on an investment, such as the interest or dividends received from holding a security.'
            },
            'inflation': {
                description: 'Inflation is the rate at which the general level of prices for goods and services is rising.'
            },
            'fed': {
                description: 'The Federal Reserve is the central banking system of the United States, responsible for monetary policy.'
            }
        };

        return termDatabase[term.toLowerCase()] || { description: 'Financial term related to U.S. Treasury markets.' };
    }

    injectWidget(widget) {
        // Inject a widget into the current page
        const widgetContainer = document.createElement('div');
        widgetContainer.id = 'treasuryviz-widget';
        widgetContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 300px;
            background: white;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            font-family: Inter, sans-serif;
        `;

        widgetContainer.innerHTML = `
            <div style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0; color: #1f2937; font-size: 16px;">TreasuryViz Widget</h3>
                    <button id="close-widget" style="background: none; border: none; font-size: 18px; cursor: pointer;">×</button>
                </div>
            </div>
            <div style="padding: 16px;">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">Live Treasury data widget</p>
                <div style="margin-top: 12px; padding: 8px; background: #f9fafb; border-radius: 4px;">
                    <div style="font-size: 12px; color: #6b7280;">10Y Treasury Yield</div>
                    <div style="font-size: 18px; font-weight: bold; color: #1f2937;">4.15%</div>
                </div>
            </div>
        `;

        document.body.appendChild(widgetContainer);

        // Close button functionality
        widgetContainer.querySelector('#close-widget').addEventListener('click', () => {
            document.body.removeChild(widgetContainer);
        });
    }

    removeWidget() {
        const widget = document.getElementById('treasuryviz-widget');
        if (widget) {
            document.body.removeChild(widget);
        }
    }

    extractFinancialData() {
        // Extract financial data from the current page
        const data = {
            url: window.location.href,
            title: document.title,
            financialTerms: [],
            treasuryMentions: 0,
            bondMentions: 0,
            yieldMentions: 0
        };

        // Count financial terms
        const text = document.body.textContent.toLowerCase();
        data.treasuryMentions = (text.match(/treasury/g) || []).length;
        data.bondMentions = (text.match(/bond/g) || []).length;
        data.yieldMentions = (text.match(/yield/g) || []).length;

        // Extract specific financial terms found
        const financialTerms = ['treasury', 'bond', 'yield', 'inflation', 'fed'];
        financialTerms.forEach(term => {
            if (text.includes(term)) {
                data.financialTerms.push(term);
            }
        });

        return data;
    }

    isTreasuryPage() {
        return window.location.href.includes('treasury.gov') || 
               window.location.href.includes('federalreserve.gov');
    }

    isFinancialNewsPage() {
        const financialNewsSites = [
            'bloomberg.com', 'reuters.com', 'wsj.com', 
            'financialtimes.com', 'cnbc.com'
        ];
        return financialNewsSites.some(site => window.location.href.includes(site));
    }

    addTreasuryEnhancements() {
        // Add specific enhancements for Treasury.gov pages
        console.log('Adding Treasury.gov enhancements');
        
        // Could add data tables, charts, or other enhancements here
    }

    addNewsEnhancements() {
        // Add specific enhancements for financial news pages
        console.log('Adding financial news enhancements');
        
        // Could add real-time data overlays, term highlighting, etc.
    }

    // Cleanup method
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        this.removeHighlights();
        this.removeWidget();
    }
}

// Initialize content script
const treasuryVizContent = new TreasuryVizContent();

// Handle page unload
window.addEventListener('beforeunload', () => {
    treasuryVizContent.destroy();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TreasuryVizContent;
}