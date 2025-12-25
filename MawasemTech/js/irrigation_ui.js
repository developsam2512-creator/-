
// ============================================
// نظام حاسبة الري المستقلة
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    populateCropSelect();

    // Default values
    document.getElementById('irrigation-type').value = 'drip';
});

// 1. Populate Crop Dropdown
function populateCropSelect() {
    const select = document.getElementById('crop-select');
    if (!select || typeof FERTILIZER_KNOWLEDGE_BASE === 'undefined') return;

    const crops = FERTILIZER_KNOWLEDGE_BASE.CROPS;
    const sortedCrops = Object.entries(crops).sort(([, a], [, b]) => a.name.localeCompare(b.name, 'ar'));

    sortedCrops.forEach(([key, data]) => {
        const option = document.createElement('option');
        option.value = key;
        option.setAttribute('data-type', data.type); // Store type (tree, vegetable, etc)
        option.textContent = data.name;
        select.appendChild(option);
    });
}

// 2. Main Calculation Function
function calculateIrrigation() {
    const calc = new IrrigationCalculator();

    // Gather Inputs
    const cropSelect = document.getElementById('crop-select');
    const cropKey = cropSelect.value;
    if (!cropKey) {
        alert('يرجى اختيار المحصول');
        return;
    }

    // Get crop type from KB or attribute
    const cropType = cropSelect.options[cropSelect.selectedIndex].getAttribute('data-type') || 'vegetable';

    const areaVal = parseFloat(document.getElementById('area').value);
    const unit = document.getElementById('area-unit').value;
    let areaHa = 0;

    if (!areaVal || areaVal <= 0) {
        alert('يرجى إدخال المساحة');
        return;
    }

    // Convert to Hectares (Logic uses ha)
    switch (unit) {
        case 'hectare': areaHa = areaVal; break;
        case 'donum': areaHa = areaVal * 0.1; break; // 1000m2
        case 'acre': areaHa = areaVal * 0.404; break;
        case 'm2': areaHa = areaVal / 10000; break;
    }

    const inputs = {
        region: document.getElementById('region').value,
        season: document.getElementById('season').value,
        crop: cropKey,
        cropType: cropType,
        area: areaHa,
        irrigationType: document.getElementById('irrigation-type').value,
        stage: document.getElementById('growth-stage').value, // 'initial', 'mid', 'end' basically
        flowRate: parseFloat(document.getElementById('flow-rate').value) || 0
    };

    // Execute Calculation
    const results = calc.calculate(inputs);

    displayResults(results);
}

// 3. Display Results
function displayResults(res) {
    document.getElementById('results-container').style.display = 'block';

    // Summary Cards
    document.getElementById('res-daily-vol').innerText = res.dailyVolume;
    document.getElementById('res-duration').innerText = res.duration ? res.duration + " ساعة" : "-";

    // Technical Details
    const detailsList = document.getElementById('technical-details');
    detailsList.innerHTML = `
        <li><strong>ETo (البخر المرجعي):</strong> ${res.eto} ملم/يوم</li>
        <li><strong>Kc (معامل المحصول):</strong> ${res.kc}</li>
        <li><strong>ETc (الاحتياج الصافي):</strong> ${(res.eto * res.kc).toFixed(2)} ملم/يوم</li>
        <li><strong>كفاءة النظام:</strong> ${(res.efficiency * 100).toFixed(0)}%</li>
        <li><strong>العمق الإجمالي (Gross):</strong> ${res.dailymm} ملم/يوم</li>
    `;

    // Notes & Warnings
    const notesDiv = document.getElementById('res-notes');
    notesDiv.innerHTML = `<p><i class="fas fa-info-circle"></i> ${res.note}</p>`;

    if (res.warning) {
        notesDiv.innerHTML += `<p style="color:red"><i class="fas fa-exclamation-triangle"></i> ${res.warning}</p>`;
    }

    if (!res.duration) {
        notesDiv.innerHTML += `<p style="color:#f57c00"><small>* أدخل معدل تدفق المضخة لحساب ساعات التشغيل.</small></p>`;
    }

    // Scroll
    document.getElementById('results-container').scrollIntoView({ behavior: 'smooth' });
}

function resetForm() {
    document.getElementById('results-container').style.display = 'none';
    document.getElementById('crop-select').value = '';
    document.getElementById('area').value = '';
}
