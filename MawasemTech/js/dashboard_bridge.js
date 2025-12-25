/**
 * dashboard_bridge.js
 * Bridges the new "Version 2025" Dashboard UI with the existing Smart Logic Engine.
 * console.log("Bridge Script Loaded");

 * 
 * Responsibilities:
 * 1. Initialize V2 UI (Crop Select, etc.) from FERTILIZER_KNOWLEDGE_BASE.
 * 2. Handle Wizard Navigation (Step 1 -> Step 2...).
 * 3. Collect Inputs from V2 UI.
 * 4. Call `FertilizerCalculator` (from fertilizer_logic.js).
 * 5. Map Scientific Results back to the V2 Financial Visuals.
 */

window.bridge = {
    state: {
        step: 1,
        crop: null,
        area: 0,
        areaUnit: 'hectare',
        soilType: 'clay',
        irrigationType: 'drip',
        season: 'spring',
        risks: 'medium',
        seedQuality: 'standard'
    },

    updateRealStats: function () {
        // 1. Crops Count (with Retry Logic)
        if (typeof FERTILIZER_KNOWLEDGE_BASE !== 'undefined') {
            const cropCount = Object.keys(FERTILIZER_KNOWLEDGE_BASE.CROPS).length;
            const el = document.getElementById('statCrops');
            if (el) el.innerText = cropCount;
        } else {
            // KB loading race condition -> Retry
            setTimeout(() => this.updateRealStats(), 500);
            return;
        }

        // 2. Calculations Count
        const calcCount = localStorage.getItem('mawasem_calc_count') || 0;
        const calcEl = document.getElementById('statCalculations');
        if (calcEl) calcEl.innerText = calcCount;

        // 3. Saved Projects Count
        const projects = JSON.parse(localStorage.getItem('mawasem_projects_list') || '[]');
        const projEl = document.getElementById('statProjects');
        if (projEl) projEl.innerText = projects.length;
    },


    init: function () {
        console.log("Initializing Dashboard Bridge...");
        this.populateCropSelect();
        this.initCharts();
        this.updateRealStats();


        this.setupTabs();

        // 2. Try to Load Saved State
        this.loadState();

        // 3. Auto-save on input changes
        this.attachAutoSave();

        // 4. Bind Header Button Explicitly (Backup for html onclick)
        const newBtn = document.getElementById('newProjectBtn');
        if (newBtn) {
            newBtn.onclick = () => this.startNewProject();
            console.log("Header button bound");
        }

        // Bind Save Button Explicitly
        const saveBtn = document.getElementById('btnSaveProject');
        if (saveBtn) {
            saveBtn.onclick = () => this.saveProject();
        }


        // 5. Navigation & Bindings
        const allNavs = document.querySelectorAll('.main-nav a');
        allNavs.forEach(link => {
            const href = link.getAttribute('href');

            if (href && href.includes('index.html')) {
                // Allow default navigation for Home (do nothing)
                return;
            } else if (href === '#projects') {
                link.onclick = (e) => { e.preventDefault(); this.showProjects(); };
            } else {
                // Default Internal Link (Dashboard / #) -> Show Calculator
                link.onclick = (e) => { e.preventDefault(); this.showCalculator(); };
            }
        });
        console.log("Dashboard Bridge Ready");

        // 6. Force Valid State
        this.goToStep(this.state.step || 1);

    },

    // ===========================================
    // 💾 State Persistence (Fix for Refresh)
    // ===========================================
    saveState: function () {
        localStorage.setItem('mawasem_state', JSON.stringify(this.state));
    },

    loadState: function () {
        const saved = localStorage.getItem('mawasem_state');
        if (saved) {
            try {
                this.state = JSON.parse(saved);
                this.state.step = parseInt(this.state.step) || 1; // Validate
                this.restoreUI();
            } catch (e) {
                console.error("Error loading state", e);
                this.state.step = 1;
            }
        }
    },

    restoreUI: function () {
        // 1. Restore Inputs
        if (this.state.crop) document.getElementById('cropType').value = this.state.crop;
        if (this.state.area) document.getElementById('areaSize').value = this.state.area;
        if (this.state.areaUnit) document.getElementById('areaUnit').value = this.state.areaUnit;
        if (this.state.soilType) document.getElementById('soilType').value = this.state.soilType;
        if (this.state.irrigationType) document.getElementById('irrigationType').value = this.state.irrigationType;
        if (this.state.season) document.getElementById('season').value = this.state.season;

        // Restore Dynamic Inputs
        if (this.state.crop) {
            this.renderDynamicInputs(this.state.crop);
        }

        // 3. Sync Navigation
        this.goToStep(this.state.step || 1);
    },



    attachAutoSave: function () {
        const inputs = document.querySelectorAll('select, input');
        inputs.forEach(input => {
            input.addEventListener('change', (e) => {
                const map = {
                    'cropType': 'crop', 'areaSize': 'area', 'areaUnit': 'areaUnit',
                    'soilType': 'soilType', 'irrigationType': 'irrigationType', 'season': 'season'
                };
                if (map[e.target.id]) {
                    this.state[map[e.target.id]] = e.target.value;
                    this.saveState();

                    // Trigger Dynamic Inputs
                    if (e.target.id === 'cropType') {
                        this.renderDynamicInputs(e.target.value);
                    }
                }
            });
        });
    },

    setupTabs: function () {
        const buttons = document.querySelectorAll('.tab-btn');
        const contents = document.querySelectorAll('.tab-content');

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active from all and hide
                buttons.forEach(b => b.classList.remove('active'));
                contents.forEach(c => {
                    c.classList.remove('active');
                    c.style.display = 'none'; // Force hide others
                });

                // Add active to clicked
                btn.classList.add('active');

                // Show content
                const tabId = btn.getAttribute('data-tab');
                const content = document.getElementById(tabId + 'Tab');
                if (content) {
                    content.classList.add('active');
                    content.style.display = 'block'; // Force show target
                }
            });
        });
    },

    populateCropSelect: function () {
        const select = document.getElementById('cropType');
        select.innerHTML = '<option value="">-- اختر المحصول --</option>';

        const crops = FERTILIZER_KNOWLEDGE_BASE.CROPS;
        const sortedCrops = Object.entries(crops).sort(([, a], [, b]) => a.name.localeCompare(b.name, 'ar'));

        sortedCrops.forEach(([key, crop]) => {
            const option = document.createElement('option');
            option.value = key;
            option.text = crop.name + (crop.type === 'tree' ? ' (أشجار)' : ' (حقل)');
            select.appendChild(option);
        });
    },

    selectOption: function (btn, inputId, value) {
        // Update UI
        const parent = btn.parentElement;
        parent.querySelectorAll('.selection-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update Hidden Input & State
        const input = document.getElementById(inputId);
        if (input) input.value = value;
        this.state[inputId] = value;
    },

    // ===========================================
    // 🧭 Robust Navigation (The Fix)
    // ===========================================
    goToStep: function (targetStep) {
        targetStep = parseInt(targetStep);

        // 1. Validate if moving forward
        if (targetStep > this.state.step) {
            if (!this.validateStep(this.state.step)) return;
        }

        // 2. Update State
        this.state.step = targetStep;
        this.saveState();

        // 3. UI Update (Clean Slate Strategy)
        // Remove active from ALL and FORCE DISPLAY NONE
        document.querySelectorAll('.step-content, .form-step, .tab-content').forEach(el => {
            el.classList.remove('active');
            if (el.classList.contains('form-step') || el.classList.contains('step-content')) {
                el.style.display = 'none'; // Force hide
            }
        });
        document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.step').forEach(el => el.classList.remove('completed')); // Clear completed status

        // Activate Target and FORCE DISPLAY BLOCK
        const stepContent = document.getElementById(`step${targetStep}`);
        if (stepContent) {
            stepContent.classList.add('active');
            stepContent.style.display = 'block'; // Force show
        }

        // Update Wizard Header
        const stepIndicator = document.querySelector(`.step[data-step="${targetStep}"]`);
        if (stepIndicator) stepIndicator.classList.add('active');

        // Mark previous steps as completed
        for (let i = 1; i < targetStep; i++) {
            const prev = document.querySelector(`.step[data-step="${i}"]`);
            if (prev) prev.classList.add('completed');
        }

        // 4. Specific Logic
        if (targetStep === 4) {
            // Activate default tab for results
            const summaryTab = document.getElementById('summaryTab');
            const summaryBtn = document.querySelector('.tab-btn[data-tab="summary"]');

            if (summaryTab) {
                summaryTab.classList.add('active');
                summaryTab.style.display = 'block';
            }
            if (summaryBtn) summaryBtn.classList.add('active');

            this.calculateResults();
        }
    },

    nextStep: function () {
        const current = parseInt(this.state.step) || 1;
        this.goToStep(current + 1);
    },

    prevStep: function () {
        const current = parseInt(this.state.step) || 1;
        this.goToStep(current - 1);
    },

    validateStep: function (step) {
        if (step === 1) {
            const crop = document.getElementById('cropType').value;
            const area = document.getElementById('areaSize').value;
            if (!crop || !area || area <= 0) {
                this.showToast('الرجاء اختيار المحصول وتحديد المساحة');
                return false;
            }
            this.state.crop = crop;
            this.state.area = parseFloat(area);
            this.state.areaUnit = document.getElementById('areaUnit').value;
            this.state.seedQuality = document.getElementById('seedQuality').value;
            this.state.region = document.getElementById('region').value;
        }
        return true;
    },

    showToast: function (msg) {
        const toast = document.getElementById('notificationToast');
        document.getElementById('toastMessage').textContent = msg;
        toast.style.display = 'flex';
        setTimeout(() => toast.style.display = 'none', 3000);
    },

    // ===========================================
    // 🧠 The Brain Link: Calling the Logic Engine
    // ===========================================
    calculateResults: function () {
        try {
            const inputs = this.gatherInputs();
            const calculator = new FertilizerCalculator();

            // 1. Calculate Fertilizer Needs
            const results = calculator.calculate(inputs);

            // 2. Calculate Seeds
            const seedResults = this.calculateSeedsInternal(inputs);

            // 3. Calculate Irrigation (NEW)
            let waterResults = null;
            if (typeof IrrigationCalculator !== 'undefined') {
                const irrCalc = new IrrigationCalculator();
                // Map inputs for irrigation logic
                const irrInputs = {
                    region: inputs.region || 'central', // Add region input to UI if missing
                    season: inputs.season,
                    crop: inputs.crop,
                    cropType: FERTILIZER_KNOWLEDGE_BASE.CROPS[inputs.crop]?.type,
                    area: results.area.hectares, // Keep in Ha
                    irrigationType: inputs.irrigation,
                    stage: inputs.phenologyStage
                };
                waterResults = irrCalc.calculate(irrInputs);
            }

            // 4. Map Results to V2 UI
            this.updateFinancials(results, seedResults, waterResults);
            this.updateQuantitiesTable(results, seedResults, waterResults);
            this.updateRecommendations(results, waterResults);
            this.updateCharts(results, seedResults);

            this.showToast('تمت الحسابات بنجاح (تسميد + بذور + ري)');



        } catch (e) {
            console.error(e);
            this.showToast('حدث خطأ في الحسابات: ' + e.message);
        }
    },

    gatherInputs: function () {
        // Collects everything needed for FertilizerCalculator.calculate(inputs)
        const s = this.state;
        return {
            mode: 'basic',
            crop: s.crop,
            area: s.area,
            areaUnit: s.areaUnit,
            soilType: document.getElementById('soilType').value,
            irrigation: document.getElementById('irrigationType').value,
            season: document.getElementById('season').value,
            // Defaulting some values not in V2 wizard yet to ensure logic runs
            phenologyStage: 'vegetative',
            cultivationType: 'open', // Default
            plantDensity: 0, // Will be auto-calculated by logic if 0 usually
            treeAge: 5 // Default for trees if not specified
        };
    },

    calculateSeedsInternal: function (inputs) {
        // A mini-logic for seeds based on KB
        const cropData = FERTILIZER_KNOWLEDGE_BASE.CROPS[inputs.crop];
        let seedsWeight = 0;
        let seedsCount = 0;
        let cost = 0;
        let warning = null;

        // Convert area to Ha
        let areaHa = inputs.area;
        if (inputs.areaUnit === 'donum') areaHa /= 10;
        if (inputs.areaUnit === 'acre') areaHa /= 2.47;
        if (inputs.areaUnit === 'meter') areaHa /= 10000;

        // Check if Vegetable (Transplant/Count based)
        const isVegetable = ['tomato', 'cucumber', 'pepper', 'zucchini', 'okra', 'eggplant'].includes(inputs.crop);

        // 1. Try Dynamic Inputs first (User Overrides)
        const dRate = parseFloat(document.getElementById('seedingRate')?.value || 0);
        const dRow = parseFloat(document.getElementById('rowSpacing')?.value || 0);
        const dPlant = parseFloat(document.getElementById('plantSpacing')?.value || 0);
        const dTree = parseFloat(document.getElementById('treeSpacing')?.value || 0);
        const dTreeRow = parseFloat(document.getElementById('treeRowSpacing')?.value || 0);

        if (dRate > 0) {
            // Manual Seeding Rate
            seedsWeight = dRate * areaHa;
            cost = seedsWeight * 5; // Approx pricing 5SAR/kg
        }
        else if (isVegetable && dRow > 0 && dPlant > 0) {
            // Veg Calculation from Spacing (cm)
            // Plants = Area(m2) / (Row(m) * Plant(m))
            const rowM = dRow / 100;
            const plantM = dPlant / 100;
            const plantsPerHa = 10000 / (rowM * plantM);
            seedsCount = plantsPerHa * areaHa;
            cost = seedsCount * 0.5; // 0.5 SAR/seedling
        }
        else if (!isVegetable && cropData.type === 'tree' && dTree > 0) {
            // Tree Calculation (Square vs Rectangular)
            const rowSpace = dTreeRow > 0 ? dTreeRow : dTree; // Fallback to square if row not cleared
            const plantsPerHa = 10000 / (dTree * rowSpace);

            seedsCount = plantsPerHa * areaHa;
            // 20% Cheaper for high density? No, keep standard
            cost = seedsCount * 15; // 15 SAR/tree
        }
        else if (cropData && cropData.seedInfo) {
            // Data exists in Knowledge Base
            if ((cropData.type === 'field' || cropData.type === 'cereal') && !isVegetable) {
                // Field Crops (Wheat, Barley, etc.) -> Weight
                // Check if we are using the fallback 150?
                const rate = cropData.seedInfo.seedingRate || 150;
                if (!cropData.seedInfo.seedingRate) {
                    warning = "بيانات البذار غير متوفرة، تم استخدام معدل افتراضي (150 كجم/هكتار). يرجى التعديل يدوياً.";
                } else {
                    // Check if it is an estimate relative to generic info
                    // No, if it is in KB, it is trusted unless user wants 100% accuracy logic from before
                    warning = null;
                }

                seedsWeight = rate * areaHa;
                cost = seedsWeight * 5;
            } else {
                // Vegetables or Trees
                const density = cropData.optimalDensity || (isVegetable ? 20000 : 400);
                seedsCount = density * areaHa;
                if (!cropData.optimalDensity) {
                    warning = isVegetable ?
                        "كثافة افتراضية (20,000 شتلة/هكتار). يرجى تحديد المسافات." :
                        "كثافة افتراضية (400 شجرة/هكتار). يرجى تحديد المسافات.";
                }
                cost = seedsCount * (isVegetable ? 0.5 : 15);
            }
        }
        else {
            // Case: cropData is missing OR cropData.seedInfo is missing completely
            // Fallback for Field Crops (assuming field if not known)
            if (!isVegetable && !inputs.crop.includes('tree')) {
                seedsWeight = 150 * areaHa;
                cost = seedsWeight * 5;
                warning = "‼️ بيانات هذا المحصول غير معرفة. تم استخدام معدل افتراضي (150 كجم). يرجى إدخال الكمية يدوياً.";
            } else {
                // Fallback for others
                seedsCount = 20000 * areaHa;
                cost = seedsCount * 0.5;
                warning = "‼️ بيانات الكثافة غير معرفة. تم تقدير العدد افتراضياً.";
            }
        }


        return { weight: seedsWeight, count: seedsCount, cost: cost, warning: warning };
    },

    // ===========================================
    // 📊 Visual Mapping
    // ===========================================
    // ===========================================
    // 📊 Visual Mapping
    // ===========================================
    updateFinancials: function (fertResults, seedResults, waterResults) {
        // Increment Global Counter
        let count = parseInt(localStorage.getItem('mawasem_calc_count') || '0');
        count++;
        localStorage.setItem('mawasem_calc_count', count);

        // Update UI immediately if visible
        const calcEl = document.getElementById('statCalculations');
        if (calcEl) calcEl.innerText = count;

        const fmt = new Intl.NumberFormat('ar-SA', { maximumFractionDigits: 0 });


        // Costs
        const fertCost = fertResults.costEstimation?.totalCost || 0;
        const seedCost = seedResults ? seedResults.cost : 0;

        // Water Cost Logic
        let waterCost = 0;
        if (waterResults) {
            // Approx cost: 0.5 SAR / m3 (pumping cost estimate)
            waterCost = waterResults.dailyVolume * 90 * 0.5; // 90 days season approx
        } else {
            waterCost = fertCost * 0.5; // Fallback
        }

        const laborCost = fertCost * 0.8;

        const totalCost = fertCost + seedCost + waterCost + laborCost;

        // Revenue (Mock based on cost for demo, or KB yield)
        const revenue = totalCost * 1.65; // 65% Margin target
        const profit = revenue - totalCost;
        const margin = (profit / totalCost) * 100;

        document.getElementById('resTotalCost').innerHTML = `${fmt.format(totalCost)} <span>ر.س</span>`;
        document.getElementById('resRevenue').innerHTML = `${fmt.format(revenue)} <span>ر.س</span>`;
        document.getElementById('resProfit').innerHTML = `${fmt.format(profit)} <span>ر.س</span>`;
        document.getElementById('resProfitMargin').innerHTML = `${margin.toFixed(1)}%`;

        // Update Chart
        if (window.financialChart) {
            window.financialChart.data.datasets[0].data = [seedCost, waterCost, fertCost, laborCost, 0, revenue];
            window.financialChart.update();
        }
    },

    updateQuantitiesTable: function (fertResults, seedResults, waterResults) {
        const tbody = document.querySelector('#detailsTable tbody');
        tbody.innerHTML = '';

        // 1. Seeds
        if (seedResults) {
            const trSeed = document.createElement('tr');
            trSeed.innerHTML = `
                <td>البذور/الشتلات</td>
                <td>${seedResults.weight > 0 ? seedResults.weight.toFixed(1) : seedResults.count.toFixed(0)}</td>
                <td>${seedResults.weight > 0 ? 'كجم' : 'شتلة'}</td>
                <td>${Math.round(seedResults.cost)} ر.س</td>
                <td>
                    جودة: ${this.state.seedQuality}
                    ${seedResults.warning ? `<br><small class="text-danger" style="color:orange"><i class="fas fa-info-circle"></i> ${seedResults.warning}</small>` : ''}
                </td>
            `;
            tbody.appendChild(trSeed);
        }

        // 2. Irrigation (New)
        if (waterResults) {
            const trWater = document.createElement('tr');
            trWater.style.background = "#e0f7fa"; // Light cyan highlight
            trWater.innerHTML = `
                <td><strong>مياه الري (للموسم)</strong></td>
                <td><strong>${waterResults.dailyVolume}</strong> / يوم</td>
                <td>متر مكعب</td>
                <td>-</td>
                <td>
                   ${waterResults.note} <br>
                   <small>ETo: ${waterResults.eto} mm | Kc: ${waterResults.kc} | Eff: ${(waterResults.efficiency * 100).toFixed(0)}%</small>
                   ${waterResults.warning ? `<br><small style="color:red">${waterResults.warning}</small>` : ''}
                </td>
            `;
            tbody.appendChild(trWater);
        }

        // 3. Fertilizers
        if (fertResults.fertilizerRecommendations) {
            fertResults.fertilizerRecommendations.forEach(rec => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>سماد: ${rec.fertilizer}</td>
                    <td>${rec.actualAmount.toFixed(1)}</td>
                    <td>${rec.unit}</td>
                    <td>${rec.cost ? Math.round(rec.cost) : '-'} ر.س</td>
                    <td>${rec.note || ''}</td>
                `;
                tbody.appendChild(tr);
            });
        }
    },

    updateRecommendations: function (results, waterResults) {
        // Smart Analysis to Recommendations
        if (results.smartAnalysis && results.smartAnalysis.length > 0) {
            const high = results.smartAnalysis.find(a => a.type === 'critical');
            if (high) document.getElementById('recSoil').textContent = high.message;

            const warn = results.smartAnalysis.find(a => a.type === 'warning');
            if (warn) {
                document.getElementById('recIrrigation').textContent = warn.message;
            } else if (waterResults) {
                // FALLBACK: Use Calculated Irrigation Note if no generic warning
                document.getElementById('recIrrigation').innerHTML = `
                    حاجة يومية: <strong>${waterResults.dailyVolume} م3</strong> <br>
                    ${waterResults.duration ? `تشغيل المضخة: <strong>${waterResults.duration} ساعة</strong>` : 'يرجى ضبط المؤقت حسب التدفق.'}
                `;
            }
        } else {
            document.getElementById('recSoil').textContent = "الظروف مثالية، لا توجد تحذيرات حرجة.";
            if (waterResults) {
                document.getElementById('recIrrigation').innerHTML = `
                    حاجة يومية: <strong>${waterResults.dailyVolume} م3</strong>.
                    كفاءة النظام: ${(waterResults.efficiency * 100).toFixed(0)}%.
                `;
            }
        }

        // Timeline
        const timeline = document.getElementById('timelineDetails');
        if (results.applicationSchedule) {
            timeline.innerHTML = results.applicationSchedule.map(s => `
                <div style="background: white; padding: 10px; margin-bottom:5px; border-right: 3px solid var(--primary-color);">
                    <strong>${s.stage}</strong>: ${s.details}
                </div>
             `).join('');
        }
    },


    updateCharts: function (results, seedResults) {
        // Update Risk Chart if available
        if (window.riskChart) {
            // 1. Determine Multiplier based on User Selection
            const riskLevel = this.state.risks || 'medium';
            let factor = 1.0;
            if (riskLevel === 'low') factor = 0.6;
            if (riskLevel === 'high') factor = 1.4;

            // 2. Base Risks + Dynamic Adjustments
            const soilRisk = (this.state.soilType === 'clay' ? 20 : 40) * factor;
            const weatherRisk = (this.state.season === 'summer' ? 70 : 30) * factor;
            const marketRisk = 45 * factor;
            const pestsRisk = 35 * factor;
            const costRisk = 60 * factor;

            window.riskChart.data.datasets[0].data = [
                Math.min(100, weatherRisk),
                Math.min(100, soilRisk),
                Math.min(100, marketRisk),
                Math.min(100, pestsRisk),
                Math.min(100, costRisk)
            ];

            // Update Label to show active level
            window.riskChart.data.datasets[0].label = `تحليل المخاطر (${riskLevel === 'high' ? 'مرتفع' : riskLevel === 'low' ? 'منخفض' : 'متوسط'})`;

            window.riskChart.update();
        }
        console.log("Charts updated with new data");
    },

    initCharts: function () {
        const ctx = document.getElementById('financialChart');
        if (ctx) {
            window.financialChart = new Chart(ctx.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: ['البذور', 'المياه', 'الأسمدة', 'العمالة', 'الاحتياطي', 'الإيراد'],
                    datasets: [{
                        label: 'القيمة (ر.س)',
                        data: [0, 0, 0, 0, 0, 0],
                        backgroundColor: ['#2ecc71', '#3498db', '#9b59b6', '#f1c40f', '#e67e22', '#27ae60']
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }

        const riskCtx = document.getElementById('riskRadarChart');
        if (riskCtx) {
            window.riskChart = new Chart(riskCtx.getContext('2d'), {
                type: 'radar',
                data: {
                    labels: ['الطقس', 'التربة', 'السوق', 'الآفات', 'التكلفة'],
                    datasets: [{
                        label: 'المخاطر',
                        data: [20, 30, 50, 40, 60],
                        backgroundColor: 'rgba(231, 76, 60, 0.2)',
                        borderColor: '#e74c3c'
                    }]
                }
            });
        }
    },

    // ===========================================
    // 💾 Actions
    // ===========================================
    saveProject: function () {
        // Validation: Ensure calculation is done
        const rCostEl = document.getElementById('resTotalCost');
        if (!rCostEl) {
            this.showToast('❌ حدث خطأ: تعذر العثور على النتائج.');
            return;
        }

        const totalCostTxt = rCostEl.innerText || "0";

        if (totalCostTxt === "0" || totalCostTxt.includes("0.00") || totalCostTxt.trim() === "") {
            this.showToast('⚠️ لا يمكن حفظ مشروع فارغ! يرجى إتمام الحسابات أولاً.');
            return;
        }

        // 1. Prepare Default Name
        const defaultName = `مشروع ${new Date().toLocaleDateString('ar-SA')} - ${this.state.crop ? FERTILIZER_KNOWLEDGE_BASE.CROPS[this.state.crop].name : ''}`;

        // 2. Open Modal instead of prompt
        const modal = document.getElementById('saveProjectModal');
        const input = document.getElementById('saveProjectName');
        if (modal && input) {
            input.value = defaultName;
            modal.style.display = 'flex';
            input.focus();
        }
    },

    confirmSaveProject: function () {
        const input = document.getElementById('saveProjectName');
        const name = input ? input.value : 'Project';

        if (name) {
            // 2. Create Snapshot
            const project = {
                id: Date.now(),
                name: name,
                date: new Date().toISOString(),
                state: JSON.parse(JSON.stringify(this.state)), // clone
                summary: {
                    totalCost: document.getElementById('resTotalCost').innerText,
                    profit: document.getElementById('resProfit').innerText
                }
            };

            // 3. Save to List
            let projects = JSON.parse(localStorage.getItem('mawasem_projects_list') || '[]');
            projects.unshift(project);
            localStorage.setItem('mawasem_projects_list', JSON.stringify(projects));

            // 4. Update UI
            this.updateRealStats();
            this.showToast('✅ تم حفظ المشروع بنجاح في أرشيف مشاريعي');
            this.showProjects();

            // 5. Close Modal
            document.getElementById('saveProjectModal').style.display = 'none';
        }
    },

    exportReport: function () {
        window.print();
        this.showToast('🖨️ جاري إعداد التقرير للطباعة...');
    },

    startNewProject: function () {
        // Direct execution - no confirmation to ensure it runs
        // if (confirm('هل أنت متأكد؟ سيتم فقدان البيانات غير المحفوظة.')) {

        // Clear Saved State
        localStorage.removeItem('mawasem_state');

        // 1. Reset State to Full Defaults
        this.state = {
            step: 1,
            crop: null,
            area: 0,
            areaUnit: 'hectare',
            soilType: 'clay',
            irrigationType: 'drip',
            season: 'spring',
            risks: 'medium',
            seedQuality: 'standard'
        };

        // 2. Reset UI Navigation (Wizard)
        this.goToStep(1);

        // Reset Result Tabs to Default (Financials)
        const defTab = document.getElementById('summaryTab');
        if (defTab) defTab.classList.add('active');
        const defBtn = document.querySelector('.tab-btn[data-tab="summary"]');
        if (defBtn) defBtn.classList.add('active');

        // 3. Reset All Form Inputs
        const inputs = ['cropType', 'areaSize', 'region'];
        inputs.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });

        // Reset Selects with defaults
        if (document.getElementById('areaUnit')) document.getElementById('areaUnit').value = 'hectare';
        if (document.getElementById('soilType')) document.getElementById('soilType').value = 'clay';
        if (document.getElementById('irrigationType')) document.getElementById('irrigationType').value = 'drip';
        if (document.getElementById('season')) document.getElementById('season').value = 'spring';
        if (document.getElementById('seedQuality')) document.getElementById('seedQuality').value = 'standard';

        // 4. Clear Results Table & Charts
        if (window.financialChart) {
            window.financialChart.data.datasets[0].data = [0, 0, 0, 0, 0, 0];
            window.financialChart.update();
        }
        document.querySelector('#detailsTable tbody').innerHTML = '';

        // 5. Clear Dynamic Inputs
        this.renderDynamicInputs(null);

        this.showToast('✨ تم بدء مشروع جديد');
    },





    // ===========================================
    // 🧠 Dynamic Logic (New Feature)
    // ===========================================
    renderDynamicInputs: function (cropKey) {
        const container = document.getElementById('dynamicCropInputs');
        if (!container) return;

        if (!cropKey) {
            container.style.display = 'none';
            container.innerHTML = '';
            return;
        }

        const cropData = FERTILIZER_KNOWLEDGE_BASE.CROPS[cropKey];
        if (!cropData) return;

        let html = '';
        container.style.display = 'grid'; // Show it
        container.style.gridTemplateColumns = '1fr 1fr';
        container.style.gap = '15px';

        // Logic based on types
        const isTree = cropData.type === 'tree';
        const isVeg = ['tomato', 'cucumber', 'pepper', 'zucchini', 'okra', 'eggplant'].includes(cropKey);

        if (isTree) {
            html = `
                <div style="grid-column: 1 / -1;">
                    <label><i class="fas fa-arrows-alt-h"></i> مسافات الزراعة (متر)</label>
                    <div style="display:flex; gap:10px; align-items:center;">
                        <div style="flex:1">
                            <label style="font-size:0.8rem; color:#666;">بين الأشجار</label>
                            <input type="number" id="treeSpacing" class="form-control" placeholder="3" value="3">
                        </div>
                        <div style="flex:1">
                            <label style="font-size:0.8rem; color:#666;">بين الصفوف (اختياري)</label>
                            <input type="number" id="treeRowSpacing" class="form-control" placeholder="5" value="5">
                        </div>
                    </div>
                    <small class="text-muted">مربع (3×3) أو مستطيل (3×5)</small>
                </div>
             `;
        }
        else if (isVeg) {
            html = `
                <div>
                    <label><i class="fas fa-arrows-alt-v"></i> المسافة بين الخطوط (سم)</label>
                    <input type="number" id="rowSpacing" class="form-control" placeholder="100" value="100">
                </div>
                <div>
                    <label><i class="fas fa-arrows-alt-h"></i> المسافة بين الشتلات (سم)</label>
                    <input type="number" id="plantSpacing" class="form-control" placeholder="40" value="40">
                </div>
            `;
        }

        else if (cropKey === 'potato') {
            const defaultRate = cropData.seedInfo?.seedingRate || 2500; // 2.5 Tons = 2500 kg
            html = `
                <div style="grid-column: 1 / -1;">
                    <label><i class="fas fa-weight-hanging"></i> كمية التقاوي (درنات)</label>
                    <div class="input-group">
                        <input type="number" id="seedingRate" class="form-control" placeholder="${defaultRate}" value="${defaultRate}">
                        <div class="input-group-append">
                            <span class="input-group-text" style="font-size:0.8em">كجم/هكتار</span>
                        </div>
                    </div>
                    <small class="text-muted">للتوضيح: 2.5 طن = 2500 كجم</small>
                </div>
            `;
        }
        else {
            // Field Crops / Cereals
            html = `
                <div style="grid-column: 1 / -1;">
                    <label><i class="fas fa-weight-hanging"></i> معدل البذار (كجم/هكتار)</label>
                    <input type="number" id="seedingRate" class="form-control" placeholder="${cropData.seedInfo?.seedingRate || 150}" value="${cropData.seedInfo?.seedingRate || 150}">
                    <small class="text-muted">الكمية الموصى بها للهكتار الواحد</small>
                </div>
             `;
        }

        container.innerHTML = `
            <h4 style="grid-column:1/-1; margin:0 0 10px 0; font-size:1rem; color:var(--primary-color);">
                <i class="fas fa-cogs"></i> إعدادات ${cropData.name} الخاصة
            </h4>
            ${html}
        `;
    },

    // Helpers for buttons calling from HTML
    selectOption: function (btn, inputId, value) {
        this.state[inputId] = value;
        // Visual update handled by CSS mostly, but logic here ensures state sync
        const parent = btn.parentElement;
        parent.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    },

    // ===========================================
    // 📂 Project Manager System
    // ===========================================
    showProjects: function () {
        const calc = document.getElementById('calculatorView');
        const mgr = document.getElementById('projectsManager');
        if (calc && mgr) {
            calc.style.display = 'none';
            mgr.style.display = 'block';
            this.renderProjectsList();
        }
        // Force scroll to top
        window.scrollTo(0, 0);
    },

    showCalculator: function () {
        const calc = document.getElementById('calculatorView');
        const mgr = document.getElementById('projectsManager');
        if (calc && mgr) {
            mgr.style.display = 'none';
            calc.style.display = 'block';
        }
    },

    renderProjectsList: function () {
        const raw = localStorage.getItem('mawasem_projects_list');
        const container = document.getElementById('projectsGrid');
        if (!container) return;

        if (!raw) {
            container.innerHTML = '<p class="text-center text-muted">لا توجد مشاريع محفوظة.</p>';
            return;
        }

        const projects = JSON.parse(raw);
        if (projects.length === 0) {
            container.innerHTML = '<p class="text-center text-muted">لا توجد مشاريع محفوظة.</p>';
            return;
        }

        let html = '<div class="project-list" style="display:grid; gap:10px;">';
        projects.forEach(p => {
            const date = new Date(p.date).toLocaleDateString('ar-SA');
            html += `
                <div class="project-card" style="background:#f8f9fa; padding:15px; border-radius:10px; display:flex; justify-content:space-between; align-items:center; border:1px solid #eee;">
                    <div>
                        <h4 style="margin:0 0 5px 0; color:var(--primary-color);">${p.name}</h4>
                        <small class="text-muted"><i class="far fa-calendar-alt"></i> ${date} | 
                        تكلفة: ${p.summary.totalCost} | ربح: ${p.summary.profit}</small>
                    </div>
                    <div>
                        <button type="button" class="btn btn-sm btn-primary" onclick="window.bridge.loadProject(${p.id})">
                            <i class="fas fa-folder-open"></i> فتح
                        </button>
                        <button type="button" class="btn btn-sm btn-danger" onclick="window.bridge.prepareDeleteProject(${p.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
    },

    loadProject: function (id) {
        const projects = JSON.parse(localStorage.getItem('mawasem_projects_list') || '[]');
        const project = projects.find(p => p.id === id);

        if (project) {
            // 1. Restore State
            this.state = project.state;
            this.saveState(); // Persist as current

            // 2. Restore UI
            this.restoreUI();

            // 3. Switch View
            this.showCalculator();

            // 4. Force Results Logic
            // If project was saved at Step 4, assume we want to see results
            // Even if not, if we have a valid crop/area, we can calc
            if (this.state.crop && this.state.area) {
                // Force navigation to result step
                this.state.step = 4;
                this.goToStep(4);
                // Note: goToStep(4) calls calculateResults() which populates the tables
                this.showToast(`📂 تم تحميل مشروع: ${project.name}`);
            }
        }
    },

    // Updated Delete Logic with Custom Modal
    prepareDeleteProject: function (id) {
        this.projectToDelete = id; // Store ID temporarily
        const modal = document.getElementById('deleteProjectModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    },

    confirmDeleteProject: function () {
        const id = this.projectToDelete;
        if (!id) return;

        let projects = JSON.parse(localStorage.getItem('mawasem_projects_list') || '[]');
        const initialCount = projects.length;
        // Filter using string coercion
        projects = projects.filter(p => String(p.id) !== String(id));

        if (projects.length === initialCount) {
            console.warn("Delete failed: ID not found", id);
            this.showToast('❌ حدث خطأ أثناء الحذف');
            return;
        }

        localStorage.setItem('mawasem_projects_list', JSON.stringify(projects));

        // Refresh UI
        this.renderProjectsList();
        this.updateRealStats();

        // Close Modal and Show Success
        const modal = document.getElementById('deleteProjectModal');
        if (modal) modal.style.display = 'none';

        this.showToast('🗑️ تم حذف المشروع بنجاح');

        this.projectToDelete = null; // Reset
    },

    // ===========================================
    // 📐 Reverse Area Calculator (Dynamic)
    // ===========================================
    showAreaCalculator: function () {
        const modal = document.getElementById('areaCalcModal');
        if (!modal) return;

        modal.style.display = 'flex';
        // Auto focus
        setTimeout(() => document.getElementById('calc_qty').focus(), 100);

        // 1. Determine Context
        const cropKey = this.state.crop || '';
        const cropData = FERTILIZER_KNOWLEDGE_BASE.CROPS[cropKey];
        const isTree = cropData ? cropData.type === 'tree' : false;
        const isVeg = ['tomato', 'cucumber', 'pepper', 'zucchini', 'okra', 'eggplant'].includes(cropKey);
        const isPotato = cropKey === 'potato';

        const lblQty = document.getElementById('lbl_calc_qty');
        const lblSp1 = document.getElementById('lbl_calc_sp1');
        const lblSp2 = document.getElementById('lbl_calc_sp2');
        const grpSp2 = document.getElementById('group_calc_sp2'); // To hide row spacing if needed

        const inputSp1 = document.getElementById('calc_sp1');
        const inputQty = document.getElementById('calc_qty');

        // Defaults
        lblQty.innerText = "العدد الكلي";
        lblSp1.innerText = "المسافة 1 (م)";
        lblSp2.innerText = "المسافة 2 (م)";
        grpSp2.style.display = 'block';
        window.calcMode = 'spacing'; // Default mode

        // Reset Inputs
        inputQty.value = ''; // Always clear quantity to force new input
        // inputSp1 will be set by logic below
        document.getElementById('calc_sp2').value = '';

        if (isTree) {
            lblQty.innerText = "عدد الأشجار الكلي";
            lblSp1.innerText = "بين الأشجار (م)";
            lblSp2.innerText = "بين الصفوف (م)";
            inputSp1.placeholder = "مثلاً: 4";
            inputSp1.value = ''; // FORCE CLEAR
        }
        else if (isVeg) {
            lblQty.innerText = "عدد الشتلات الكلي";
            lblSp1.innerText = "بين الشتلات (م)";
            lblSp2.innerText = "بين الصفوف (م)";
            inputSp1.placeholder = "مثلاً: 0.4";
            inputSp1.value = ''; // FORCE CLEAR
        }
        else if (isPotato) {
            // Potato Special Case
            window.calcMode = 'weight';
            lblQty.innerText = "وزن التقاوي الكلي (كجم)";
            lblSp1.innerText = "معدل التقاوي (كجم/هكتار)";
            grpSp2.style.display = 'none';

            // Set Default Value (2500 kg = 2.5 Tons)
            inputSp1.value = 2500;
        }
        else {
            // Field Crops (Wheat, Barley, Corn-Grain) -> Weight Based usually
            window.calcMode = 'weight';
            lblQty.innerText = "وزن البذور الكلي (كجم)";
            lblSp1.innerText = "معدل البذار (كجم/هكتار)";
            grpSp2.style.display = 'none';

            // Set Default Value (150 kg generic)
            inputSp1.value = 150;
        }

        // Bind inputs for live calc
        ['calc_qty', 'calc_sp1', 'calc_sp2'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.onkeyup = () => this.updateAreaCalcDisplay();
                el.onchange = () => this.updateAreaCalcDisplay();
            }
        });

        // Clear previous results display
        this.updateAreaCalcDisplay(); // Run once to set zeros
    },

    updateAreaCalcDisplay: function () {
        const qty = parseFloat(document.getElementById('calc_qty').value) || 0;
        const sp1 = parseFloat(document.getElementById('calc_sp1').value) || 0;
        const sp2 = parseFloat(document.getElementById('calc_sp2').value) || 0;

        let areaM2 = 0;

        if (window.calcMode === 'weight') {
            // Weight Mode: Area (Ha) = Total Weight / Rate (kg/ha)
            // convert result Ha to m2 for standardization
            if (qty > 0 && sp1 > 0) {
                const areaHa = qty / sp1;
                areaM2 = areaHa * 10000;
            }
        } else {
            // Spacing Mode: Area = Count * (Space1 * Space2)
            if (qty > 0 && sp1 > 0 && sp2 > 0) {
                areaM2 = qty * sp1 * sp2;
            }
        }

        if (areaM2 > 0) {
            const unit = document.getElementById('areaUnit').value;
            let finalArea = areaM2;
            let unitLabel = 'متر مربع';

            if (unit === 'hectare') { finalArea /= 10000; unitLabel = 'هكتار'; }
            if (unit === 'donum') { finalArea /= 1000; unitLabel = 'دونم'; }
            if (unit === 'acre') { finalArea /= 4047; unitLabel = 'فدان'; }

            document.getElementById('calc_result_display').innerText = finalArea.toFixed(2) + ' ' + unitLabel;
            document.getElementById('calc_result_details').innerText = '(' + areaM2.toLocaleString() + ' متر مربع)';
        } else {
            document.getElementById('calc_result_display').innerText = '0.00 ' + document.getElementById('areaUnit').value;
            document.getElementById('calc_result_details').innerText = '(0 متر مربع)';
        }
    },

    resetAreaCalcInputs: function () {
        document.getElementById('calc_qty').value = '';
        if (window.calcMode !== 'weight') {
            document.getElementById('calc_sp1').value = '';
        }
        document.getElementById('calc_sp2').value = '';
        this.updateAreaCalcDisplay(); // Update to show 0
        document.getElementById('calc_qty').focus();
    },

    applyArea: function () {
        const str = document.getElementById('calc_result_display').innerText;
        const val = parseFloat(str);
        if (val > 0) {
            document.getElementById('areaSize').value = val;
            this.state.area = val; // Sync state
            document.getElementById('areaCalcModal').style.display = 'none';
            this.showToast('✅ تم اعتماد المساحة: ' + val);
        } else {
            alert('يرجى إدخال البيانات لحساب المساحة أولاً');
        }
    }
};

// Auto-init on load
document.addEventListener('DOMContentLoaded', () => {
    window.bridge.init();
});

// Helpers for buttons calling from HTML
window.selectOption = (b, i, v) => window.bridge.selectOption(b, i, v);
