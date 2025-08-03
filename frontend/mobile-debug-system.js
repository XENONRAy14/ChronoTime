// SYSTÈME DE DEBUG MOBILE - SURVEILLANCE ERREURS TEMPS RÉEL
(function() {
    'use strict';
    
    // Configuration debug
    const DEBUG_CONFIG = {
        SHOW_CONSOLE_ON_ERROR: true,
        SHOW_TOUCH_EVENTS: false,
        SHOW_PERFORMANCE_METRICS: true,
        MAX_ERROR_HISTORY: 50
    };
    
    // État du debug
    let debugState = {
        errors: [],
        touchEvents: [],
        performanceMetrics: {},
        isDebugVisible: false
    };
    
    // Éléments UI debug
    let debugElements = {
        panel: null,
        toggle: null,
        content: null
    };
    
    // Initialisation
    document.addEventListener('DOMContentLoaded', initDebugSystem);
    
    function initDebugSystem() {
        console.log('🐛 Système debug mobile - Initialisation...');
        
        createDebugUI();
        setupErrorHandling();
        setupPerformanceMonitoring();
        setupTouchEventMonitoring();
        
        console.log('✅ Système debug mobile - Actif');
    }
    
    function createDebugUI() {
        // Bouton toggle debug
        debugElements.toggle = document.createElement('div');
        debugElements.toggle.innerHTML = '🐛';
        debugElements.toggle.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 40px;
            height: 40px;
            background: rgba(255, 0, 0, 0.8);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            cursor: pointer;
            z-index: 10000;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
            transition: all 0.2s ease;
        `;
        
        // Panel debug
        debugElements.panel = document.createElement('div');
        debugElements.panel.style.cssText = `
            position: fixed;
            top: 60px;
            right: 10px;
            width: 300px;
            max-height: 400px;
            background: rgba(0, 0, 0, 0.95);
            color: #00ff00;
            font-family: 'Courier New', monospace;
            font-size: 11px;
            border-radius: 8px;
            padding: 10px;
            z-index: 9999;
            display: none;
            overflow-y: auto;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
            border: 1px solid #333;
        `;
        
        debugElements.content = document.createElement('div');
        debugElements.panel.appendChild(debugElements.content);
        
        // Events
        debugElements.toggle.addEventListener('click', toggleDebugPanel);
        
        document.body.appendChild(debugElements.toggle);
        document.body.appendChild(debugElements.panel);
    }
    
    function setupErrorHandling() {
        // Capturer toutes les erreurs JavaScript
        window.addEventListener('error', (e) => {
            const error = {
                timestamp: new Date().toLocaleTimeString(),
                message: e.message,
                filename: e.filename?.split('/').pop() || 'unknown',
                line: e.lineno,
                column: e.colno,
                stack: e.error?.stack || 'No stack trace'
            };
            
            addError(error);
            
            if (DEBUG_CONFIG.SHOW_CONSOLE_ON_ERROR) {
                showDebugPanel();
            }
        });
        
        // Capturer les promesses rejetées
        window.addEventListener('unhandledrejection', (e) => {
            const error = {
                timestamp: new Date().toLocaleTimeString(),
                message: `Promise rejected: ${e.reason}`,
                filename: 'promise',
                line: 0,
                column: 0,
                stack: e.reason?.stack || 'No stack trace'
            };
            
            addError(error);
        });
        
        // Intercepter console.error
        const originalError = console.error;
        console.error = function(...args) {
            const error = {
                timestamp: new Date().toLocaleTimeString(),
                message: args.join(' '),
                filename: 'console',
                line: 0,
                column: 0,
                stack: new Error().stack || 'No stack trace'
            };
            
            addError(error);
            originalError.apply(console, args);
        };
    }
    
    function setupPerformanceMonitoring() {
        // Surveiller les performances
        if ('performance' in window) {
            setInterval(() => {
                const memory = performance.memory;
                debugState.performanceMetrics = {
                    timestamp: new Date().toLocaleTimeString(),
                    usedJSHeapSize: memory ? Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB' : 'N/A',
                    totalJSHeapSize: memory ? Math.round(memory.totalJSHeapSize / 1024 / 1024) + 'MB' : 'N/A',
                    jsHeapSizeLimit: memory ? Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB' : 'N/A'
                };
                
                updateDebugDisplay();
            }, 2000);
        }
    }
    
    function setupTouchEventMonitoring() {
        if (!DEBUG_CONFIG.SHOW_TOUCH_EVENTS) return;
        
        ['touchstart', 'touchmove', 'touchend'].forEach(eventType => {
            document.addEventListener(eventType, (e) => {
                const touchEvent = {
                    timestamp: new Date().toLocaleTimeString(),
                    type: eventType,
                    touches: e.touches.length,
                    target: e.target.tagName + (e.target.className ? '.' + e.target.className.split(' ')[0] : '')
                };
                
                addTouchEvent(touchEvent);
            }, { passive: true });
        });
    }
    
    function addError(error) {
        debugState.errors.unshift(error);
        if (debugState.errors.length > DEBUG_CONFIG.MAX_ERROR_HISTORY) {
            debugState.errors.pop();
        }
        
        updateDebugDisplay();
        
        // Vibration pour signaler l'erreur
        if ('vibrate' in navigator) {
            navigator.vibrate([100, 50, 100]);
        }
    }
    
    function addTouchEvent(touchEvent) {
        debugState.touchEvents.unshift(touchEvent);
        if (debugState.touchEvents.length > 20) {
            debugState.touchEvents.pop();
        }
        
        updateDebugDisplay();
    }
    
    function updateDebugDisplay() {
        if (!debugState.isDebugVisible) return;
        
        let html = '<div style="color: #ff6b6b; font-weight: bold; margin-bottom: 10px;">🐛 DEBUG MOBILE</div>';
        
        // Performances
        if (DEBUG_CONFIG.SHOW_PERFORMANCE_METRICS && debugState.performanceMetrics.timestamp) {
            html += `
                <div style="color: #4ecdc4; margin-bottom: 8px;">
                    📊 PERFORMANCES (${debugState.performanceMetrics.timestamp})
                </div>
                <div style="margin-left: 10px; margin-bottom: 10px; font-size: 10px;">
                    Mémoire: ${debugState.performanceMetrics.usedJSHeapSize}<br>
                    Total: ${debugState.performanceMetrics.totalJSHeapSize}<br>
                    Limite: ${debugState.performanceMetrics.jsHeapSizeLimit}
                </div>
            `;
        }
        
        // Erreurs
        if (debugState.errors.length > 0) {
            html += '<div style="color: #ff6b6b; margin-bottom: 8px;">❌ ERREURS</div>';
            debugState.errors.slice(0, 5).forEach(error => {
                html += `
                    <div style="margin-left: 10px; margin-bottom: 8px; padding: 5px; background: rgba(255, 107, 107, 0.1); border-radius: 3px;">
                        <div style="color: #ff6b6b; font-weight: bold;">${error.timestamp}</div>
                        <div style="color: #ffa726;">${error.filename}:${error.line}</div>
                        <div style="color: #fff; word-break: break-word;">${error.message}</div>
                    </div>
                `;
            });
        }
        
        // Événements tactiles
        if (DEBUG_CONFIG.SHOW_TOUCH_EVENTS && debugState.touchEvents.length > 0) {
            html += '<div style="color: #95e1d3; margin-bottom: 8px;">👆 TOUCH EVENTS</div>';
            debugState.touchEvents.slice(0, 5).forEach(event => {
                html += `
                    <div style="margin-left: 10px; margin-bottom: 5px; font-size: 10px;">
                        ${event.timestamp} - ${event.type} (${event.touches}) on ${event.target}
                    </div>
                `;
            });
        }
        
        // État des systèmes
        html += '<div style="color: #a8e6cf; margin-bottom: 8px;">🔧 SYSTÈMES</div>';
        html += '<div style="margin-left: 10px; font-size: 10px;">';
        
        if (window.MapMobileUnified) {
            const mapState = window.MapMobileUnified.getState();
            html += `Carte: ${mapState.isMapActive ? '🟢 Active' : '⚪ Inactive'}<br>`;
            html += `Isolation: ${mapState.isIsolationMode ? '🔒 ON' : '🔓 OFF'}<br>`;
        }
        
        html += `Navigation: ${typeof MobileNavigation !== 'undefined' ? '🟢' : '🔴'}<br>`;
        html += `Leaflet: ${typeof L !== 'undefined' ? '🟢' : '🔴'}<br>`;
        html += '</div>';
        
        debugElements.content.innerHTML = html;
    }
    
    function toggleDebugPanel() {
        debugState.isDebugVisible = !debugState.isDebugVisible;
        
        if (debugState.isDebugVisible) {
            showDebugPanel();
        } else {
            hideDebugPanel();
        }
    }
    
    function showDebugPanel() {
        debugState.isDebugVisible = true;
        debugElements.panel.style.display = 'block';
        debugElements.toggle.style.background = 'rgba(255, 0, 0, 1)';
        updateDebugDisplay();
    }
    
    function hideDebugPanel() {
        debugState.isDebugVisible = false;
        debugElements.panel.style.display = 'none';
        debugElements.toggle.style.background = 'rgba(255, 0, 0, 0.8)';
    }
    
    // API publique
    window.MobileDebug = {
        show: showDebugPanel,
        hide: hideDebugPanel,
        toggle: toggleDebugPanel,
        getErrors: () => debugState.errors,
        clearErrors: () => {
            debugState.errors = [];
            updateDebugDisplay();
        }
    };
    
})();
