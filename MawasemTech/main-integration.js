// =============================
// الملف: main-integration.js
// =============================

// دالة التهيئة الرئيسية
function initializeStorageSystem() {
    window.storageIntegration = new StorageIntegration();

    // ربط مع نظام الحساب الحالي
    if (window.irrigationSystem) {
        // نربط بدالة الحساب المتقدم
        const originalAdvancedCalc = window.irrigationSystem.handleAdvancedCalculation;
        window.irrigationSystem.handleAdvancedCalculation = function () {
            // نستدعي الدالة الأصلية
            // (Note: handleAdvancedCalculation doesn't return results, it calls displayResults. 
            // We need to hook into the Calculator directly or rely on events)

            // Better approach: wrap the calculator method
            const originalCalc = window.irrigationSystem.calculator.comprehensiveCalculation;
            window.irrigationSystem.calculator.comprehensiveCalculation = function (data) {
                const results = originalCalc.apply(this, arguments);

                // Inject Region from DOM if not present
                if (!data.region) {
                    const regionEl = document.getElementById('advRegion');
                    if (regionEl && regionEl.value) {
                        data.region = regionEl.value;
                    } else {
                        data.region = 'undefined'; // Or handle gracefully
                    }
                }

                // إطلاق حدث للحفظ
                const event = new CustomEvent('calculationComplete', {
                    detail: {
                        inputData: data,
                        results: results
                    }
                });
                document.dispatchEvent(event);

                return results;
            };

            // Call the UI handler
            originalAdvancedCalc.apply(window.irrigationSystem);
        };

        // نربط بدالة الحساب البسيط أيضاً
        const originalBasicCalc = window.irrigationSystem.handleBasicCalculation;
        window.irrigationSystem.handleBasicCalculation = function () {
            const originalCalc = window.irrigationSystem.calculator.basicCalculation;
            window.irrigationSystem.calculator.basicCalculation = function (cropId, area, region, systemId, season) {
                const results = originalCalc.apply(this, arguments);

                const data = { crop: cropId, area, region, system: systemId, season };
                const event = new CustomEvent('calculationComplete', {
                    detail: {
                        inputData: data,
                        results: results
                    }
                });
                document.dispatchEvent(event);

                return results;
            };

            originalBasicCalc.apply(window.irrigationSystem);
        };
    }

    // إضافة أزرار الحفظ إلى واجهة النتائج
    addButtonsToResults();

    // إضافة زر إدارة المزارع في الهيدر أو مكان واضح
    addManagerButtonToHeader();

    console.log('✅ نظام التخزين مفعل وجاهز للاستخدام');
}

function addButtonsToResults() {
    // ننتظر حتى يتم إنشاء قسم النتائج (أو نضيفه ونخفيه)
    const container = document.getElementById('resultsSection');
    if (!container) return;

    // نتأكد من عدم التكرار
    if (document.getElementById('storage-actions-container')) return;

    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'storage-actions-container';
    buttonContainer.className = 'results-actions';
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '15px';
    buttonContainer.style.marginTop = '20px';
    buttonContainer.style.justifyContent = 'center';
    buttonContainer.style.flexWrap = 'wrap';

    const saveButton = document.createElement('button');
    saveButton.className = 'btn btn-primary';
    saveButton.innerHTML = '<i class="fas fa-save"></i> حفظ النتائج';
    saveButton.onclick = (e) => { e.preventDefault(); window.storageIntegration.showSaveOptions(); };

    const loadButton = document.createElement('button');
    loadButton.className = 'btn btn-secondary';
    loadButton.innerHTML = '<i class="fas fa-folder-open"></i> مزارعي المحفوظة';
    loadButton.onclick = (e) => { e.preventDefault(); window.storageIntegration.showFarmsManager(); };

    buttonContainer.appendChild(saveButton);
    buttonContainer.appendChild(loadButton);

    // نضيفه بعد container النتائج وقبل زر العودة
    const dashboardContainer = document.getElementById('dashboardContainer');
    if (dashboardContainer) {
        dashboardContainer.parentNode.insertBefore(buttonContainer, dashboardContainer.nextSibling);
    } else {
        container.appendChild(buttonContainer);
    }
}

function addManagerButtonToHeader() {
    const header = document.querySelector('.header');
    if (!header) return;

    const btn = document.createElement('button');
    btn.innerHTML = '<i class="fas fa-tractor"></i> مزارعي';
    btn.className = 'home-link'; // Reuse existing style
    btn.style.right = 'auto';
    btn.style.left = '20px';
    btn.onclick = (e) => { e.preventDefault(); window.storageIntegration.showFarmsManager(); };

    header.appendChild(btn);
}

// تهيئة النظام عند تحميل الصفحة
window.addEventListener('load', () => {
    // wait a bit for the main system to init
    setTimeout(initializeStorageSystem, 500);
});
