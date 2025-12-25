
// ============================================
// نظام حاسبة البذور والشتلات
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    populateCropSelect();
});

// 1. Populate Crop Dropdown from KB
function populateCropSelect() {
    const select = document.getElementById('crop-select');
    // Using FERTILIZER_KNOWLEDGE_BASE from fertilizer_data.js
    const crops = FERTILIZER_KNOWLEDGE_BASE.CROPS;

    // Convert to array and sort by Arabic name
    const sortedCrops = Object.entries(crops).sort(([, a], [, b]) => a.name.localeCompare(b.name, 'ar'));

    sortedCrops.forEach(([key, data]) => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = data.name;
        select.appendChild(option);
    });
}

// 2. Dynamic UI Handling
function updateCalculatorMode(cropKey) {
    const container = document.getElementById('dynamic-inputs');
    if (!cropKey) {
        container.innerHTML = `<div class="text-center" style="color:#777; padding:20px;">
                    <i class="fas fa-arrow-up"></i> يرجى اختيار المحصول أولاً لتحديد طريقة الحساب
                 </div>`;
        return;
    }

    const cropData = FERTILIZER_KNOWLEDGE_BASE.CROPS[cropKey];
    let html = '';

    // Scenario A: Field Crops (Grains/Forage) -> Direct Seeding by Weight
    if ((cropData.type === 'field' || cropData.type === 'cereal') && !isVegetable(cropKey)) {
        html = generateFieldCropInputs(cropData);
    }
    // Scenario B: Vegetables (Tomato/Cucumber) -> Transplants or Precision
    else if (cropData.type === 'field' || isVegetable(cropKey)) {
        html = generateVegetableInputs(cropData);
    }
    // Scenario C: Trees -> Count
    else if (cropData.type === 'tree') {
        html = generateTreeInputs(cropData);
    }

    container.innerHTML = html;
}

// Helper to distinguish Field Veg from Field Grains
function isVegetable(key) {
    const vegList = ['tomato', 'cucumber', 'pepper', 'zucchini', 'okra', 'eggplant'];
    return vegList.includes(key);
}

// --- HTML Generators ---

function generateFieldCropInputs(crop) {
    return `
    <div class="advanced-fields">
        <h3 class="section-title"><i class="fas fa-tractor"></i> زراعة حقلية (بذور)</h3>
        <p class="mb-20">يعتمد الحساب على الكثافة في المتر المربع ووزن الحبة.</p>
        
        <div class="form-grid">
            <div class="input-group">
                <label>طريقة الزراعة</label>
                <select id="planting-method">
                    <option value="broadcasting">نثر (Broadcasting)</option>
                    <option value="drilling">تسطير (Drilling) - موفرة</option>
                </select>
            </div>
             <div class="input-group">
                <label>وزن الألف حبة (جرام)</label>
                <input type="number" id="tgw" placeholder="مثال: ${crop.seedInfo?.TGW || 40}" value="${crop.seedInfo?.TGW || ''}">
                <div class="input-hint">هذا الرقم يحدد وزن البذور بدقة.</div>
            </div>
            <div class="input-group">
                <label>معدل الإنبات (%)</label>
                <input type="number" id="germination" value="90" max="100">
            </div>
             <div class="input-group">
                <label>نسبة النقاوة (%)</label>
                <input type="number" id="purity" value="98" max="100">
            </div>
        </div>
    </div>`;
}

function generateVegetableInputs(crop) {
    return `
    <div class="advanced-fields">
        <h3 class="section-title"><i class="fas fa-seedling"></i> زراعة خضر (شتلات/دقيقة)</h3>
        
        <div class="form-grid">
             <div class="input-group">
                <label>نوع الزراعة</label>
                <select id="veg-planting-mode" onchange="toggleNurserySection(this.value)">
                    <option value="transplant">شتلات (مشتل)</option>
                    <option value="direct">بذور مباشرة</option>
                </select>
            </div>
        
            <div class="input-group">
                <label>المسافة بين الخطوط (سم)</label>
                <input type="number" id="row-spacing" placeholder="مثال: 100">
            </div>
             <div class="input-group">
                <label>المسافة بين النباتات (سم)</label>
                <input type="number" id="plant-spacing" placeholder="مثال: 40">
            </div>
        </div>

        <!-- Nursery Specifics -->
        <div id="nursery-section" style="margin-top:15px; background:#e8f5e9; padding:15px; border-radius:8px;">
            <h4 style="margin-bottom:10px;"><i class="fas fa-th"></i> بيانات المشتل</h4>
            <div class="form-grid">
                <div class="input-group">
                    <label>نوع الصينية (عدد العيون)</label>
                    <select id="tray-type">
                        <option value="209">209 عين (خس/ورقيات)</option>
                        <option value="128">128 عين (طماطم/فلفل)</option>
                        <option value="72">72 عين (قرعيات/بطيخ)</option>
                        <option value="50">50 عين</option>
                    </select>
                </div>
                 <div class="input-group">
                    <label>نسبة الفقد (%)</label>
                    <input type="number" id="loss-rate" value="10" placeholder="فاقد المشتل والحقل">
                </div>
            </div>
        </div>
    </div>`;
}

window.toggleNurserySection = function (mode) {
    const el = document.getElementById('nursery-section');
    el.style.display = mode === 'transplant' ? 'block' : 'none';
}


function generateTreeInputs(crop) {
    return `
    <div class="advanced-fields">
         <h3 class="section-title"><i class="fas fa-tree"></i> بستان (أشجار)</h3>
         <div class="form-grid">
            <div class="input-group">
                <label>المسافة بين الصفوف (متر)</label>
                <input type="number" id="row-spacing-m" placeholder="مثال: 8">
            </div>
             <div class="input-group">
                <label>المسافة بين الأشجار (متر)</label>
                <input type="number" id="tree-spacing-m" placeholder="مثال: 6">
            </div>
            <div class="input-group">
                <label>نسبة بدل تالف (%)</label>
                <input type="number" id="loss-rate" value="5">
            </div>
         </div>
    </div>`;
}

// 3. Calculation Logic
window.calculateSeeds = function () {
    // Inputs
    const cropKey = document.getElementById('crop-select').value;
    const cropData = FERTILIZER_KNOWLEDGE_BASE.CROPS[cropKey];

    // Area Conversion to m2
    const areaVal = parseFloat(document.getElementById('area').value);
    const unit = document.getElementById('area-unit').value;
    let areaM2 = 0;

    if (!areaVal || areaVal <= 0) { alert('يرجى إدخال المساحة'); return; }

    switch (unit) {
        case 'm2': areaM2 = areaVal; break;
        case 'dunam': areaM2 = areaVal * 1000; break;
        case 'hectare': areaM2 = areaVal * 10000; break;
        case 'acre': areaM2 = areaVal * 4046.86; break;
    }

    let result = {};

    // Logic Switch
    if ((cropData.type === 'field' || cropData.type === 'cereal') && !isVegetable(cropKey)) {
        // Field Crop Logic
        const tgw = parseFloat(document.getElementById('tgw').value) || 40; // Default 40g
        const method = document.getElementById('planting-method').value;

        // Standard Seed Rate (Target Plants / m2)
        // Assume Wheat: ~300-400 plants/m2
        // If not in KB, assume 350
        const targetDensity = 350;

        // Formula: Seed Rate (kg/ha) = (Target Plants/m2 * TGW) / (Germination * Purity * 100) * 100
        // Simplified: Total g = Plants_Total * (TGW / 1000) / (Germination * Purity)

        const germ = (parseFloat(document.getElementById('germination').value) || 90) / 100;
        const purity = (parseFloat(document.getElementById('purity').value) || 98) / 100;

        // Efficiency based on method
        const methodFactor = method === 'broadcasting' ? 1.2 : 1.0; // Broadcasting wastes 20%

        const totalPlants = areaM2 * targetDensity;
        const rawWeightG = totalPlants * (tgw / 1000); // grams
        const finalWeightKg = (rawWeightG / (germ * purity) * methodFactor) / 1000;

        result = {
            type: 'weight',
            value: finalWeightKg,
            details: [
                `الكثافة المستهدفة: ${targetDensity} نبات/م²`,
                `وزن الألف حبة: ${tgw} جم`,
                `عامل الطريقة (${method}): x${methodFactor}`
            ]
        };

    } else if (cropData.type === 'tree') {
        // Tree Logic
        const row = parseFloat(document.getElementById('row-spacing-m').value);
        const plant = parseFloat(document.getElementById('tree-spacing-m').value);
        const loss = (parseFloat(document.getElementById('loss-rate').value) || 0) / 100;

        if (!row || !plant) { alert('يرجى إدخال المسافات'); return; }

        const count = Math.floor(areaM2 / (row * plant));
        const total = Math.ceil(count * (1 + loss));

        result = {
            type: 'count',
            value: total,
            details: [
                `العدد الصافي: ${count} شجرة`,
                `هامش بدل تالف: +${Math.ceil(count * loss)} شجرة`
            ]
        };

    } else {
        // Vegetable / Transplant Logic
        const row = parseFloat(document.getElementById('row-spacing').value) / 100; // cm to m
        const plant = parseFloat(document.getElementById('plant-spacing').value) / 100; // cm to m

        if (!row || !plant) { alert('يرجى إدخال المسافات'); return; }

        const count = Math.floor(areaM2 / (row * plant));

        // Nursery
        const mode = document.getElementById('veg-planting-mode').value;

        if (mode === 'transplant') {
            const loss = (parseFloat(document.getElementById('loss-rate').value) || 0) / 100;
            const traySize = parseInt(document.getElementById('tray-type').value);

            const totalSeedlings = Math.ceil(count * (1 + loss));
            const trays = Math.ceil(totalSeedlings / traySize);

            // Nursery Area: Approx 1m2 fits 4 trays
            const nurseryArea = Math.ceil(trays / 4);

            result = {
                type: 'nursery',
                value: totalSeedlings,
                trays: trays,
                traySize: traySize,
                nurseryArea: nurseryArea,
                details: [
                    `العدد في الحقل: ${count} شتلة`,
                    `هامش الفقد: +${Math.ceil(count * loss)} شتلة`,
                    `سعة الصينية: ${traySize} عين`
                ]
            };
        } else {
            // Direct Seeding Veg
            // Assuming 2 seeds per hole usually + safety
            const totalSeeds = Math.ceil(count * 2 * 1.1); // 2 seeds + 10%
            // Convert to weight? TGW usually low (3-5g for tomato)
            // Display Count is better for veg
            result = {
                type: 'count',
                value: totalSeeds,
                details: [`معدل 2 بذرة للجورة + 10% احتياطي`]
            };
        }
    }

    displayResults(result);
};

function displayResults(res) {
    document.getElementById('results-container').style.display = 'block';

    const qtyVal = document.getElementById('quantity-value');
    const qtyUnit = document.getElementById('quantity-unit');
    const title = document.getElementById('result-summary-title');
    const subtitle = document.getElementById('result-summary-subtitle');
    const tableBody = document.getElementById('technical-details-body');
    const nurseryCard = document.getElementById('nursery-card');

    // Reset
    nurseryCard.style.display = 'none';
    tableBody.innerHTML = '';

    // Populate Table
    res.details.forEach(detail => {
        const row = `<tr><td colspan="2" style="text-align:right;">${detail}</td></tr>`;
        tableBody.innerHTML += row;
    });

    if (res.type === 'weight') {
        title.innerText = "وزن البذور المطلوب";
        subtitle.innerText = "بناءً على الكثافة ووزن الحبة";

        qtyVal.innerText = res.value.toFixed(2);
        qtyUnit.innerText = "كجم";

        // Suggest Bags? e.g. 50kg bag
        if (res.value > 50) {
            const bags = Math.ceil(res.value / 50);
            tableBody.innerHTML += `<tr><td>عدد الأكياس (50 كجم)</td><td>${bags} كيس تقريباً</td></tr>`;
        }

    } else if (res.type === 'count') {
        title.innerText = "العدد المطلوب";
        subtitle.innerText = "عدد البذور أو الشتلات";

        qtyVal.innerText = res.value.toLocaleString();
        qtyUnit.innerText = "حبة / شتلة";

    } else if (res.type === 'nursery') {
        title.innerText = "تقرير المشتل";
        subtitle.innerText = "احتياجات الشتلات والصواني";

        qtyVal.innerText = res.value.toLocaleString();
        qtyUnit.innerText = "شتلة";

        nurseryCard.style.display = 'block';
        const list = document.getElementById('nursery-details');
        list.innerHTML = `
            <li><strong>${res.trays}</strong> صينية <small>(${res.traySize} عين)</small></li>
            <li>مساحة المشتل التقريبية: <strong>${res.nurseryArea}</strong> م²</li>
        `;
    }

    // Smooth scroll
    document.getElementById('results-container').scrollIntoView({ behavior: 'smooth' });
}

function resetForm() {
    document.getElementById('dynamic-inputs').innerHTML = `<div class="text-center" style="color:#777; padding:20px;">
                    <i class="fas fa-arrow-up"></i> يرجى اختيار المحصول أولاً لتحديد طريقة الحساب
                 </div>`;
    document.getElementById('results-container').style.display = 'none';
    document.getElementById('crop-select').value = '';
    document.getElementById('area').value = '';
}
