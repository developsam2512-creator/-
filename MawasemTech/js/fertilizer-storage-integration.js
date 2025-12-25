
// ==========================================
// Fertilizer Storage Integration
// Connects fertilizer_logic.js with storage-system.js
// ==========================================

// ==========================================
// Fertilizer Wallet & Storage Integration
// Handles saving, loading, and managing fertilizer plans.
// ==========================================

// --- Polyfill for setMode if missing (Fix for View Button) ---
window.setMode = function (mode) {
    console.log('[Integration] Polyfill setMode switching to:', mode);
    const modes = ['basic', 'intermediate', 'advanced'];

    // 1. Hide all inputs & Reset Tabs
    modes.forEach(m => {
        const container = document.getElementById(`${m}-inputs`);
        const btn = document.getElementById(`${m}-mode`);
        if (container) {
            container.classList.remove('active');
            container.style.display = 'none';
        }
        if (btn) btn.classList.remove('active');
    });

    // 2. Activate Target
    const targetInput = document.getElementById(`${mode}-inputs`);
    const targetBtn = document.getElementById(`${mode}-mode`);

    if (targetInput) {
        targetInput.classList.add('active');
        targetInput.style.display = 'block';
    }
    if (targetBtn) {
        targetBtn.classList.add('active');
    }
};

// Immediate execution with retry logic
(function initFertilizerStorage() {
    console.log('Initializing Fertilizer Storage System...');

    function tryInit(attempts = 0) {
        if (typeof SmartStorageSystem !== 'undefined') {
            try {
                console.log('Found SmartStorageSystem, initializing...');
                window.fertilizerStorage = new SmartStorageSystem();
                console.log('Storage initialized successfully');
                injectWalletSummary();
            } catch (e) {
                console.error('CRITICAL: Failed to initialize SmartStorageSystem:', e);
                // Visible alert for debugging
                alert('عذراً، حدث خطأ في تهيئة نظام الحفظ:\n' + e.message);
            }
        } else {
            console.warn(`SmartStorageSystem not found (attempt ${attempts + 1}). Retrying...`);
            if (attempts < 5) {
                setTimeout(() => tryInit(attempts + 1), 200);
            } else {
                console.error('Failed to load SmartStorageSystem after multiple attempts.');
            }
        }
    }

    tryInit();
})();

function injectWalletSummary() {
    // Remove existing if any (to avoid duplicates on re-run)
    const existing = document.querySelector('.fertilizer-wallet-summary');
    if (existing) existing.remove();

    if (!window.fertilizerStorage) return;

    const wallet = window.fertilizerStorage.getFertilizerWallet();

    const walletDiv = document.createElement('div');
    walletDiv.className = 'fertilizer-wallet-summary';
    // Styled to look like a premium dashboard widget
    walletDiv.style.cssText = `
        background: linear-gradient(135deg, #f1f8e9 0%, #dcedc8 100%);
        padding: 12px 20px;
        border-radius: 12px;
        margin: 15px auto;
        border: 1px solid #c5e1a5;
        box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        justify-content: center;
        align-items: center;
        width: 90%;
        max-width: 800px;
        animation: fadeIn 0.5s ease-in-out;
    `;

    walletDiv.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px; color:#2e7d32; font-weight:bold;">
            <i class="fas fa-wallet" style="font-size:1.2em;"></i>
            <span>محفظة الأسمدة:</span>
        </div>
        
        <div style="display:flex; gap:15px; background:white; padding:5px 15px; border-radius:20px; box-shadow:inset 0 2px 4px rgba(0,0,0,0.02);">
            <span title="إجمالي النيتروجين" style="color:#1b5e20;"><strong>N:</strong> ${Math.round(wallet.total_npk.n)} <small>كجم</small></span>
            <span style="width:1px; background:#ddd;"></span>
            <span title="إجمالي الفوسفور" style="color:#e65100;"><strong>P:</strong> ${Math.round(wallet.total_npk.p)} <small>كجم</small></span>
            <span style="width:1px; background:#ddd;"></span>
            <span title="إجمالي البوتاسيوم" style="color:#283593;"><strong>K:</strong> ${Math.round(wallet.total_npk.k)} <small>كجم</small></span>
        </div>

        <div style="background:#fff3e0; color:#e65100; padding:5px 12px; border-radius:8px; font-weight:bold;">
            <strong>التكلفة:</strong> ${wallet.total_cost} ريال
        </div>
    `;

    // Improved Target Logic:
    // 1. Try after header
    const header = document.querySelector('header.header');
    if (header) {
        header.parentNode.insertBefore(walletDiv, header.nextSibling);
    }
    // 2. Try container
    else {
        const container = document.querySelector('.container');
        if (container) {
            container.insertBefore(walletDiv, container.firstChild);
        } else {
            // 3. Last resort: Body
            document.body.insertBefore(walletDiv, document.body.firstChild);
        }
    }
}

// Function to call from fertilizer_logic.js when calculation is done
// Function to call from fertilizer_logic.js when calculation is done
function saveCurrentPlanToStorage(results, inputs) {
    console.log('Saving plan to storage...');
    if (!window.fertilizerStorage) {
        console.warn('Fertilizer Storage not initialized! Attempting re-init...');
        window.fertilizerStorage = new SmartStorageSystem();
    }

    // Safely calculate totals from recommendations if not present
    let safeTotals = { n: 0, p: 0, k: 0 };
    if (results.totals) {
        safeTotals = results.totals;
    } else if (results.fertilizerRecommendations) {
        results.fertilizerRecommendations.forEach(rec => {
            if (rec.nutrient === 'N') safeTotals.n += rec.actualAmount;
            if (rec.nutrient === 'P2O5') safeTotals.p += rec.actualAmount;
            if (rec.nutrient === 'K2O') safeTotals.k += rec.actualAmount;
        });
    }

    // Safe crop name
    let cropName = inputs.crop || 'غير محدد';
    // Try to get Arabic name if global KB is available
    if (typeof FERTILIZER_KNOWLEDGE_BASE !== 'undefined' && FERTILIZER_KNOWLEDGE_BASE.CROPS[inputs.crop]) {
        cropName = FERTILIZER_KNOWLEDGE_BASE.CROPS[inputs.crop].name;
    }

    const planData = {
        crop: cropName,
        area: inputs.area,
        totals: safeTotals,
        schedule: results.applicationSchedule || [],
        estimatedCost: 0,
        fullInputs: inputs // Save full inputs for restoration
    };

    const totalKg = (safeTotals.n || 0) + (safeTotals.p || 0) + (safeTotals.k || 0);
    planData.estimatedCost = Math.round(totalKg * 5); // Basic cost estimation

    // Input Summary for UI
    planData.inputSummary = {
        crop: cropName,
        area: inputs.area + ' دونم'
    };

    try {
        const result = window.fertilizerStorage.saveFertilizerPlan(planData);

        if (result.success) {
            console.log('Plan saved successfully:', result.planId);
            injectWalletSummary(); // Refresh UI

            // Custom Toast
            const notif = document.createElement('div');
            notif.innerHTML = '<i class="fas fa-wallet"></i> تم حفظ الخطة في المحفظة';
            notif.style.cssText = 'position: fixed; bottom: 20px; left: 20px; background: #2e7d32; color: white; padding: 12px 24px; border-radius: 50px; z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.2); font-family: Cairo, sans-serif; display:flex; align-items:center; gap:8px;';
            document.body.appendChild(notif);
            setTimeout(() => {
                notif.style.opacity = '0';
                notif.style.transition = 'opacity 0.5s';
                setTimeout(() => notif.remove(), 500);
            }, 3000);

            return true; // Success
        } else {
            console.error('Failed to save plan:', result.error);
            alert('فشل حفظ الخطة: ' + result.error);
            return false;
        }
    } catch (err) {
        console.error('Error saving plan:', err);
        alert('حدث خطأ غير متوقع أثناء الحفظ: ' + err.message);
        return false;
    }
}

// Global function to open wallet modal
window.openFertilizerWallet = function () {
    console.log('Opening Fertilizer Wallet (Enhanced)...');

    // 1. Create Modal HTML if not exists
    let modal = document.getElementById('fertilizer-wallet-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'fertilizer-wallet-modal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5); z-index: 9999; display: flex;
            justify-content: center; align-items: center; backdrop-filter: blur(5px);
        `;

        modal.innerHTML = `
            <div style="background: white; width: 95%; max-width: 700px; height: 90vh; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
                <!-- Header -->
                <div style="padding: 15px 20px; background: linear-gradient(135deg, #2e7d32, #4caf50); color: white; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <i class="fas fa-wallet" style="font-size:1.5em;"></i>
                        <h3 style="margin: 0; font-family:Cairo;">محفظة خططي</h3>
                    </div>
                    <button onclick="document.getElementById('fertilizer-wallet-modal').style.display='none'" style="background: none; border: none; color: white; font-size: 1.2rem; cursor: pointer;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <!-- Search & Filters -->
                <div style="padding: 10px 20px; background: #f1f8e9; border-bottom: 1px solid #c8e6c9;">
                    <div style="position: relative;">
                        <input type="text" id="wallet-search-input" placeholder="ابحث عن محصول..." 
                            onkeyup="window.renderFilteredPlans()" 
                            style="width: 100%; padding: 10px 40px 10px 15px; border: 1px solid #ddd; border-radius: 25px; outline: none; font-family: Cairo;">
                        <i class="fas fa-search" style="position: absolute; right: 15px; top: 50%; transform: translateY(-50%); color: #999;"></i>
                    </div>
                </div>

                <!-- Plans List -->
                <div id="wallet-plans-list" style="padding: 20px; overflow-y: auto; flex: 1; background: #fdfdfd;">
                    <!-- Plans will be loaded here -->
                </div>

                <!-- Footer -->
                <div style="padding: 15px; border-top: 1px solid #eee; text-align: center; background: #f8f9fa; display:flex; justify-content:space-between; gap:10px;">
                    <button class="btn btn-secondary btn-small" onclick="document.getElementById('fertilizer-wallet-modal').style.display='none'" style="flex:2;">إغلاق المحفظة</button>
                    <button class="btn" onclick="window.resetFertilizerWallet()" style="flex:1; background:#ffebee; color:#c62828; border:1px solid #ffcdd2; font-size:0.8rem;">
                        <i class="fas fa-trash-restore"></i> تهيئة الذاكرة
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // 2. Load Plans
    modal.style.display = 'flex';
    if (window.fertilizerStorage) {
        const plans = window.fertilizerStorage.getFertilizerHistory();
        window.allWalletPlans = plans; // Cache for filtering
        renderWalletPlans(plans);
    } else {
        document.getElementById('wallet-plans-list').innerHTML = '<div style="color:red; text-align:center;">خطأ: نظام التخزين غير مهيأ.</div>';
    }
};

window.renderFilteredPlans = function () {
    const query = document.getElementById('wallet-search-input').value.toLowerCase();
    const filtered = window.allWalletPlans.filter(p => {
        const crop = (p.crop || p.inputSummary?.crop || '').toLowerCase();
        return crop.includes(query);
    });
    renderWalletPlans(filtered);
};

// --- REFACTORED RENDER LOGIC (Patterned after Irrigation Wallet) ---

window.createPlanCard = function (plan, diffDays) {
    try {
        // 1. Safe Data Extraction & Type Casting
        const cropName = String(plan.crop || (plan.inputSummary ? plan.inputSummary.crop : 'غير محدد'));
        const areaVal = String(plan.area || (plan.inputSummary ? plan.inputSummary.area : '-'));
        const dateObj = new Date(plan.date || plan.timestamp || Date.now());

        // 2. Date Formatting
        const timeStr = dateObj.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
        const dateStr = dateObj.toLocaleDateString('ar-SA');
        const displayTime = (diffDays === 0) ? timeStr : dateStr;

        // 3. Totals Calculation
        let totalKg = 0;
        if (plan.totalAmount) totalKg = Number(plan.totalAmount);
        else if (plan.totals) {
            totalKg = (Number(plan.totals.n) || 0) + (Number(plan.totals.p) || 0) + (Number(plan.totals.k) || 0);
        }

        // 4. Icon Logic
        let icon = 'fa-seedling';
        let color = '#2e7d32'; // Default Green
        if (cropName.includes('نخيل') || cropName.includes('شجر') || cropName.includes('ليمون') || cropName.includes('مانجو')) {
            icon = 'fa-tree';
            color = '#795548'; // Brown
        } else if (cropName.includes('طماطم') || cropName.includes('خيار') || cropName.includes('فلفل')) {
            icon = 'fa-carrot';
            color = '#ff5722'; // Orange
        }

        // 5. Build HTML
        return `
        <div class="wallet-card" style="background: white; border: 1px solid #e0e0e0; border-radius: 10px; padding: 15px; margin-bottom: 12px; position:relative; overflow:hidden;">
            <!-- Type Strip -->
            <div style="position:absolute; right:0; top:0; bottom:0; width:4px; background:${color};"></div>

            <div style="display:flex; gap:15px; align-items:flex-start;">
                <!-- Icon Box -->
                <div style="width:50px; height:50px; background:${color}15; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                     <i class="fas ${icon}" style="font-size:1.5rem; color:${color};"></i>
                </div>

                <!-- Content -->
                <div style="flex:1;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                        <h4 style="margin:0; color:#333; font-size:1.1rem;">${cropName}</h4>
                        <span style="font-size:0.8rem; color:#999;">${displayTime}</span>
                    </div>
                    
                    <div style="display:flex; gap:15px; font-size:0.9rem; color:#555; margin-bottom:12px;">
                        <span><i class="fas fa-ruler-combined" style="color:#aaa;"></i> المساحة: <strong>${areaVal}</strong></span>
                        <span><i class="fas fa-weight-hanging" style="color:#aaa;"></i> الإجمالي: <strong>${Math.round(totalKg)} كجم</strong></span>
                        ${plan.estimatedCost ? `<span><i class="fas fa-tags" style="color:#aaa;"></i> <strong>${plan.estimatedCost} ريال</strong></span>` : ''}
                    </div>

                    <!-- Actions -->
                    <div style="display:flex; gap:10px;">
                        <button onclick="loadPlanIntoView('${plan.id}')" style="flex:1; background:#f1f8e9; color:#33691e; border:1px solid #dcedc8; padding:6px; border-radius:6px; font-weight:bold; cursor:pointer; transition:0.2s;">
                            عرض التفاصيل
                        </button>
                        <button onclick="triggerDeletePlan('${plan.id}')" style="background:white; color:#c62828; border:1px solid #ffcdd2; padding:6px 12px; border-radius:6px; cursor:pointer; transition:0.2s;">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>`;

    } catch (e) {
        console.error('Card Creation Error:', e);
        return `
        <div style="padding:15px; color:#c62828; background:#ffebee; border:1px solid #ffcdd2; border-radius:8px; margin-bottom:10px;">
            <strong>خطأ غير متوقع في البطاقة:</strong><br>${e.message}
        </div>`;
    }
};

window.renderWalletPlans = function (plans, container) {
    if (!container) container = document.getElementById('wallet-plans-list');

    if (!plans || plans.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: #777;">
                <div style="background:#f5f5f5; width:80px; height:80px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 20px auto;">
                    <i class="fas fa-search" style="font-size: 2rem; color: #bdbdbd;"></i>
                </div>
                <h4 style="margin:0 0 10px 0;">لا توجد خطط محفوظة</h4>
                <p style="font-size:0.9rem;">اضغط على "حفظ في المحفظة" بعد إجراء أي حساب.</p>
            </div>`;
        return;
    }

    // Sort: Newest First
    plans.sort((a, b) => new Date(b.date || b.timestamp || 0) - new Date(a.date || a.timestamp || 0));

    // Groups
    const groups = { today: [], week: [], older: [] };
    const now = new Date();

    plans.forEach(plan => {
        const d = new Date(plan.date || plan.timestamp || Date.now());
        const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));

        // Pass diffDays to the plan object if needed, or handle in loop
        // We will pass diffDays to createPlanCard
        plan._diffDays = diffDays; // Temp storage for render

        if (diffDays === 0) groups.today.push(plan);
        else if (diffDays <= 7) groups.week.push(plan);
        else groups.older.push(plan);
    });

    let html = '';

    const renderSection = (title, list) => {
        if (list.length === 0) return '';
        const cardsHtml = list.map(p => window.createPlanCard(p, p._diffDays)).join('');
        return `
            <h5 style="color:#666; margin:15px 0 10px 0; border-bottom:2px solid #eee; padding-bottom:5px;">
                ${title} <span style="font-size:0.8em; background:#eee; padding:2px 8px; border-radius:10px;">${list.length}</span>
            </h5>
            ${cardsHtml}
        `;
    };

    html += renderSection('اليوم', groups.today);
    html += renderSection('هذا الأسبوع', groups.week);
    html += renderSection('الأرشيف', groups.older);

    container.innerHTML = html;
}

window.loadPlanIntoView = function (id) {
    console.log('Restoring plan:', id);
    if (!window.fertilizerStorage) return;

    const plans = window.fertilizerStorage.getFertilizerHistory();
    const plan = plans.find(p => p.id === id);

    if (!plan) {
        alert("عذراً، لم يتم العثور على الخطة.");
        return;
    }

    if (!plan.fullInputs) {
        alert("هذه الخطة محفوظة بتنسيق قديم، لا يمكن استعادة المدخلات بالكامل.");
        return;
    }

    // Restore State
    try {
        const inputs = plan.fullInputs;
        console.log('Restoring inputs:', inputs);

        // --- 1. SET MODE SAFELY ---
        // Ensure mode exists, default to 'basic' if not found or if simply 'undefined'
        let mode = inputs.mode || 'basic';
        if (!mode) mode = 'basic'; // Double check

        console.log('Restoring mode:', mode);

        // Call the Global setMode (polyfilled above if missing)
        if (typeof window.setMode === 'function') {
            window.setMode(mode);
        } else {
            // Fallback
            console.warn('setMode missing, forcing basic display');
            const basicInput = document.getElementById('basic-inputs');
            if (basicInput) basicInput.style.display = 'block';
        }



        // 2. Populate Fields
        // Need to wait slightly for UI switch if it's async (usually sync here)
        setTimeout(() => {
            // Common Fields
            const suffix = mode === 'basic' ? '' : (mode === 'intermediate' ? '-intermediate' : '-advanced');

            if (document.getElementById(`crop-type${suffix}`)) document.getElementById(`crop-type${suffix}`).value = inputs.crop;
            if (document.getElementById(`area${suffix}`)) document.getElementById(`area${suffix}`).value = inputs.area;
            if (document.getElementById(`soil-type${suffix}`)) document.getElementById(`soil-type${suffix}`).value = inputs.soilType;

            // Advanced / Intermediate specific
            if (inputs.ph && document.getElementById('soil-ph')) document.getElementById('soil-ph').value = inputs.ph;
            if (inputs.ec && document.getElementById('soil-ec')) document.getElementById('soil-ec').value = inputs.ec;

            // Trigger Changes to update UI state
            if (document.getElementById(`crop-type${suffix}`)) document.getElementById(`crop-type${suffix}`).dispatchEvent(new Event('change'));

            // 3. Trigger Calculation
            // We use the global calculateFertilizer function
            // Wait for UI updates
            setTimeout(() => {
                if (typeof calculateFertilizer === 'function') {
                    console.log('Triggering calculation...');
                    calculateFertilizer(mode);

                    // Close modal
                    document.getElementById('fertilizer-wallet-modal').style.display = 'none';

                    // Scroll to results with retry logic to ensure it happens after rendering
                    setTimeout(() => {
                        const resSection = document.getElementById('results-section');
                        const cardsSection = document.getElementById('fertilizer-cards');

                        if (resSection && resSection.style.display !== 'none') {
                            resSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        } else if (cardsSection) {
                            cardsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        } else {
                            // Fallback to bottom of page
                            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                        }
                    }, 500); // Increased delay to ensure rendering is complete
                }
            }, 300);

        }, 100);

    } catch (e) {
        console.error('Failed to restore plan:', e);
        alert('حدث خطأ أثناء استعادة الخطة.');
    }
};

window.triggerDeletePlan = function (id) {
    if (confirm('هل أنت متأكد من حذف هذه الخطة بشكل نهائي؟')) {
        try {
            if (window.fertilizerStorage && typeof window.fertilizerStorage.deleteFertilizerPlan === 'function') {
                const result = window.fertilizerStorage.deleteFertilizerPlan(id);
                if (result.success) {
                    // Success feedback
                    const notif = document.createElement('div');
                    notif.innerHTML = '<i class="fas fa-trash-alt"></i> تم الحذف بنجاح';
                    notif.style.cssText = 'position: fixed; bottom: 20px; left: 20px; background: #c62828; color: white; padding: 10px 20px; border-radius: 50px; z-index: 10001; font-family: Cairo;';
                    document.body.appendChild(notif);
                    setTimeout(() => notif.remove(), 2000);

                    // Refresh List (Using enhanced method)
                    // If modal is open, refresh it.
                    if (document.getElementById('fertilizer-wallet-modal') && document.getElementById('fertilizer-wallet-modal').style.display !== 'none') {
                        // Reload plans
                        const plans = window.fertilizerStorage.getFertilizerHistory();
                        window.allWalletPlans = plans;
                        window.renderFilteredPlans(); // Re-render preserving filter
                    }
                } else {
                    alert("فشل الحذف: " + (result.error || 'خطأ غير معروف'));
                }
            } else {
                console.error("Storage system missing deleteFertilizerPlan method");
                alert("نظام الحذف غير جاهز. حاول تحديث الصفحة.");
            }
        } catch (e) {
            console.error(e);
            alert("حدث خطأ استثنائي أثناء الحذف: " + e.message);
        }
    }
};

// Ensure Mode Buttons work
document.addEventListener('DOMContentLoaded', function () {
    ['basic', 'intermediate', 'advanced'].forEach(mode => {
        const btn = document.getElementById(mode + '-mode');
        if (btn) {
            btn.addEventListener('click', function () {
                if (typeof window.setMode === 'function') window.setMode(mode);
            });
        }
    });
});


window.resetFertilizerWallet = function () {
    if (confirm('تحذير: هذا سيقوم بمسح جميع بيانات الخطط المحفوظة وإعادة تهيئة الذاكرة. هل أنت متأكد؟')) {
        try {
            localStorage.removeItem('fertilizer_plans_history');
            localStorage.removeItem('fertilizer_wallet_ledger');
            alert('تمت إعادة تهيئة الذاكرة بنجاح. سيتم تحديث الصفحة الآن.');
            location.reload();
        } catch (e) {
            alert('فشل إعادة التهيئة: ' + e.message);
        }
    }
};
