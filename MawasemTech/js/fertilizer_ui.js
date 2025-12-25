
/**
 * fertilizer_ui.js
 * Controller for the Standalone Fertilizer Calculator
 */

window.fertilizerController = {
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

    init: function () {
        console.log("Initializing Fertilizer UI...");
        this.populateCropSelect();
        this.setupTabs();
        this.initCharts();

        // Setup Event Listeners for Buttons
        document.querySelectorAll('.selection-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const parts = btn.getAttribute('onclick').match(/'([^']+)'/g).map(s => s.replace(/'/g, ''));
                if (parts.length >= 2) this.selectOption(btn, parts[0], parts[1]);
            });
        });

        // Initialize Step 1
        this.goToStep(1);
    },

    populateCropSelect: function () {
        const select = document.getElementById('cropType');
        if (!select) return;
        select.innerHTML = '<option value="">-- اختر المحصول --</option>';

        const crops = FERTILIZER_KNOWLEDGE_BASE.CROPS;
        const sortedCrops = Object.entries(crops).sort(([, a], [, b]) => a.name.localeCompare(b.name, 'ar'));

        sortedCrops.forEach(([key, crop]) => {
            const option = document.createElement('option');
            option.value = key;
            option.text = crop.name + (crop.type === 'tree' ? ' (أشجار)' : ' (حقل)');
            select.appendChild(option);
        });

        // On Change listener for dynamic inputs
        select.addEventListener('change', (e) => {
            this.state.crop = e.target.value;
            // potential dynamic inputs handling here
        });
    },

    selectOption: function (btn, inputId, value) {
        // UI
        const parent = btn.parentElement;
        parent.querySelectorAll('.selection-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // State
        const input = document.getElementById(inputId);
        if (input) input.value = value;
        this.state[inputId] = value;
    },

    // Navigation
    goToStep: function (targetStep) {
        targetStep = parseInt(targetStep);

        // Validate
        if (targetStep > this.state.step) {
            if (this.state.step === 1) {
                const crop = document.getElementById('cropType').value;
                const area = document.getElementById('areaSize').value;
                if (!crop || !area) {
                    alert('يرجى اختيار المحصول وتحديد المساحة');
                    return;
                }
                this.state.crop = crop;
                this.state.area = parseFloat(area);
                this.state.areaUnit = document.getElementById('areaUnit').value;
                this.state.region = document.getElementById('region').value;
            }
        }

        this.state.step = targetStep;

        // UI Updates
        document.querySelectorAll('.form-step').forEach(el => {
            el.classList.remove('active');
            el.style.display = 'none';
        });
        document.querySelectorAll('.step').forEach(el => el.classList.remove('active', 'completed'));

        // Show Target
        const activeStep = document.getElementById(`step${targetStep}`);
        if (activeStep) {
            activeStep.classList.add('active');
            activeStep.style.display = 'block';
        }

        // Header Workflow
        const stepInd = document.querySelector(`.step[data-step="${targetStep}"]`);
        if (stepInd) stepInd.classList.add('active');
        for (let i = 1; i < targetStep; i++) {
            const prev = document.querySelector(`.step[data-step="${i}"]`);
            if (prev) prev.classList.add('completed');
        }

        if (targetStep === 4) this.calculateResults();
    },

    nextStep: function () { this.goToStep(this.state.step + 1); },
    prevStep: function () { this.goToStep(this.state.step - 1); },

    // Calculation
    calculateResults: function () {
        try {
            const inputs = this.gatherInputs();
            const calculator = new FertilizerCalculator();
            const results = calculator.calculate(inputs);

            // Render
            this.updateFinancials(results);
            this.updateQuantitiesTable(results);
            this.updateRecommendations(results);
            this.updateCharts(results);

        } catch (e) {
            console.error(e);
            alert('حدث خطأ في الحسابات');
        }
    },

    gatherInputs: function () {
        return {
            mode: 'basic',
            crop: this.state.crop,
            area: this.state.area,
            areaUnit: this.state.areaUnit,
            soilType: document.getElementById('soilType').value,
            irrigation: document.getElementById('irrigationType').value,
            season: document.getElementById('season').value,
            phenologyStage: 'vegetative'
        };
    },

    // Visuals
    updateFinancials: function (results) {
        const cost = results.costEstimation?.totalCost || 0;
        const revenue = cost * 1.6; // Mock
        const profit = revenue - cost;

        const fmt = new Intl.NumberFormat('ar-SA');
        document.getElementById('resTotalCost').innerHTML = `${fmt.format(cost)} <span>ر.س</span>`;
        document.getElementById('resRevenue').innerHTML = `${fmt.format(revenue)} <span>ر.س</span>`;
        document.getElementById('resProfit').innerHTML = `${fmt.format(profit)} <span>ر.س</span>`;

        if (window.financialChart) {
            window.financialChart.data.datasets[0].data = [cost * 0.3, cost * 0.1, cost * 0.4, cost * 0.2]; // Dummy breakdown
            window.financialChart.update();
        }
    },

    updateQuantitiesTable: function (results) {
        const tbody = document.querySelector('#detailsTable tbody');
        tbody.innerHTML = '';
        if (results.fertilizerRecommendations) {
            results.fertilizerRecommendations.forEach(rec => {
                tbody.innerHTML += `
                    <tr>
                        <td>${rec.fertilizer}</td>
                        <td>${rec.actualAmount.toFixed(1)}</td>
                        <td>${rec.unit}</td>
                        <td>${rec.cost ? Math.round(rec.cost) : '-'} ر.س</td>
                        <td>${rec.note || ''}</td>
                    </tr>`;
            });
        }
    },

    updateRecommendations: function (results) {
        // ... (Simplified for brevity, similar format)
        document.getElementById('recSoil').innerText = "تأكد من تحليل التربة قبل البدء.";

        const timeline = document.getElementById('timelineDetails');
        if (results.applicationSchedule) {
            timeline.innerHTML = results.applicationSchedule.map(s => `
                <div style="background: white; padding: 10px; margin-bottom:5px; border-right: 3px solid var(--primary-color);">
                    <strong>${s.stage}</strong>: ${s.fertilizer} (${s.amount} ${s.unit})
                </div>
             `).join('');
        }
    },

    setupTabs: function () {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');

                btn.classList.add('active');
                document.getElementById(btn.getAttribute('data-tab') + 'Tab').style.display = 'block';
            });
        });
    },

    initCharts: function () {
        const ctx = document.getElementById('financialChart');
        if (ctx) {
            window.financialChart = new Chart(ctx.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: ['البذور', 'المياه', 'الأسمدة', 'العمالة'],
                    datasets: [{
                        label: 'التكلفة',
                        data: [0, 0, 0, 0],
                        backgroundColor: ['#2ecc71', '#3498db', '#9b59b6', '#f1c40f']
                    }]
                }
            });
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    window.fertilizerController.init();
});
