
// ============================================
// MARKET PLAN & BRIDGE LOGIC
// ============================================

/**
 * Transfers scientific calculation results to the Market Plan inputs.
 */
window.bridgeToMarketPlan = function (n, p, k) {
    console.log("Bridging to Market Plan:", n, p, k);

    // Initialize Totals
    let totals = { N: n, P: p, K: k, Ca: 0, Mg: 0, S: 0, Fe: 0, Zn: 0 };

    // Try to get detailed breakdown from global result if available
    if (window.lastCalculationResult && window.lastCalculationResult.fertilizerRecommendations) {
        const recs = window.lastCalculationResult.fertilizerRecommendations;

        // Reset and recalculate from recommendations to ensure accuracy
        totals = { N: 0, P: 0, K: 0, Ca: 0, Mg: 0, S: 0, Fe: 0, Zn: 0 };

        recs.forEach(rec => {
            if (rec.nutrient === 'N') totals.N += rec.actualAmount;
            if (rec.nutrient === 'P2O5') totals.P += rec.actualAmount;
            if (rec.nutrient === 'K2O') totals.K += rec.actualAmount;
            if (rec.nutrient === 'CaO') totals.Ca += rec.actualAmount;
            if (rec.nutrient === 'MgO') totals.Mg += rec.actualAmount;
            if (rec.nutrient === 'S') totals.S += rec.actualAmount;
            if (rec.nutrient === 'Fe') totals.Fe += rec.actualAmount;
            if (rec.nutrient === 'Zn') totals.Zn += rec.actualAmount;
        });
    }

    // Fill Bridge Inputs with Ceiling values (or fixed for micros)
    const safe = (val) => val ? Math.ceil(val) : 0;
    const safeFloat = (val) => val ? parseFloat(val.toFixed(2)) : 0;

    if (document.getElementById('bridge-need-n')) document.getElementById('bridge-need-n').value = safe(totals.N);
    if (document.getElementById('bridge-need-p')) document.getElementById('bridge-need-p').value = safe(totals.P);
    if (document.getElementById('bridge-need-k')) document.getElementById('bridge-need-k').value = safe(totals.K);

    // New Fields
    if (document.getElementById('bridge-need-ca')) document.getElementById('bridge-need-ca').value = safe(totals.Ca);
    if (document.getElementById('bridge-need-mg')) document.getElementById('bridge-need-mg').value = safe(totals.Mg);
    if (document.getElementById('bridge-need-s')) document.getElementById('bridge-need-s').value = safe(totals.S);
    if (document.getElementById('bridge-need-fe')) document.getElementById('bridge-need-fe').value = safeFloat(totals.Fe);
    if (document.getElementById('bridge-need-zn')) document.getElementById('bridge-need-zn').value = safeFloat(totals.Zn);

    // Show Container
    const container = document.getElementById('market-plan-container');
    if (container) {
        container.style.display = 'block';
        container.scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * Switches between Single and Mix tabs in the Market Plan.
 * @param {string} tab - 'single' or 'mix'
 */
function switchMarketTab(tab) {
    // Update Buttons
    document.querySelectorAll('#market-plan-container .tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`#market-plan-container .tab[data-tab="${tab}"]`).classList.add('active');

    // Update Content
    document.querySelectorAll('#market-plan-container .tab-content').forEach(c => c.style.display = 'none');
    document.getElementById(`market-${tab}-tab`).style.display = 'block';
}

/**
 * Helper to fill the Single Fertilizer form from presets.
 */
function fillMarketSingle(name, n, p, k, price) {
    document.getElementById('market-single-name').value = name;
    document.getElementById('market-n').value = n;
    document.getElementById('market-p').value = p;
    document.getElementById('market-k').value = k;
    if (price) document.getElementById('market-price').value = price;
}

/**
 * Calculates costs and amounts for a single commercial fertilizer.
 * Determines the limiting factor to cover ALL requirements.
 */
/**
 * Helper to parse numbers that might be in Arabic or English locales
 */
function parseLocaleNumber(stringNumber) {
    if (!stringNumber) return 0;
    const englishNumber = stringNumber.toString()
        .replace(/[٠١٢٣٤٥٦٧٨٩]/g, d => d.charCodeAt(0) - 1632)
        .replace(/[۰۱۲۳۴۵۶۷۸۹]/g, d => d.charCodeAt(0) - 1776);
    return parseFloat(englishNumber) || 0;
}

/**
 * Calculates costs and amounts for a single commercial fertilizer.
 * Determines the limiting factor to cover ALL requirements.
 */
function calculateMarketSingle() {
    const n = parseLocaleNumber(document.getElementById('market-n').value);
    const p = parseLocaleNumber(document.getElementById('market-p').value);
    const k = parseLocaleNumber(document.getElementById('market-k').value);
    const weight = parseLocaleNumber(document.getElementById('market-weight').value) || 50;
    const price = parseLocaleNumber(document.getElementById('market-price').value);

    // Get Bridge Needs (Correctly handling Arabic inputs manually entered)
    const reqN = parseLocaleNumber(document.getElementById('bridge-need-n').value);
    const reqP = parseLocaleNumber(document.getElementById('bridge-need-p').value);
    const reqK = parseLocaleNumber(document.getElementById('bridge-need-k').value);

    console.log("Calculated Inputs:", { n, p, k, reqN, reqP, reqK });

    if (reqN === 0 && reqP === 0 && reqK === 0) {
        alert("لا توجد احتياجات مسجلة! يرجى اعتماد خطة من النتائج أو إدخال الأرقام يدوياً.");
        return;
    }

    // Calculate amount needed to cover each specific nutrient requirement
    // Formula: Required / (Percentage / 100)
    const calc = (req, pct) => pct > 0 ? req / (pct / 100) : 0;

    const amountForN = calc(reqN, n);
    const amountForP = calc(reqP, p);
    const amountForK = calc(reqK, k);

    // Max amount ensures all needs are met
    const maxAmount = Math.max(amountForN, amountForP, amountForK);

    if (maxAmount === 0) {
        alert(`السماد المختار (${n}-${p}-${k}) لا يحتوي على أي من العناصر المطلوبة (${reqN}-${reqP}-${reqK})!`);
        return;
    }

    const bags = Math.ceil(maxAmount / weight);
    const cost = bags * price;

    // Display Stats
    const statsDiv = document.getElementById('market-single-stats');
    statsDiv.innerHTML = `
        <div class="result-card">
            <h5>الكمية المطلوبة</h5>
            <div class="result-value">${Math.ceil(maxAmount)} كجم</div>
        </div>
        <div class="result-card">
            <h5>عدد الأكياس</h5>
            <div class="result-value">${bags} كيس</div>
            <small>وزن ${weight} كجم</small>
        </div>
        <div class="result-card">
            <h5>التكلفة الكلية</h5>
            <div class="result-value">${cost.toLocaleString()} ريال</div>
        </div>
        <div class="result-card">
            <h5>كفاية العناصر</h5>
            <div style="font-size:0.9em; text-align:right;">
                ${n > 0 ? `<div>N: تغطية ${Math.round((maxAmount * n / 100 / (reqN || 1)) * 100)}%</div>` : ''}
                ${p > 0 ? `<div>P: تغطية ${Math.round((maxAmount * p / 100 / (reqP || 1)) * 100)}%</div>` : ''}
                ${k > 0 ? `<div>K: تغطية ${Math.round((maxAmount * k / 100 / (reqK || 1)) * 100)}%</div>` : ''}
            </div>
        </div>
    `;

    document.getElementById('market-single-results').style.display = 'block';
}

// ============================================
// SMART MIX LOGIC (Greedy Algorithm)
// ============================================

// Adds a new row to the inventory with FULL nutrient fields
function addInventoryItem() {
    const id = Date.now();
    const div = document.createElement('div');
    div.className = 'fertilizer-item';
    div.id = `inv-${id}`;
    div.innerHTML = `
        <div class="grid-3" style="align-items:end;">
            <div class="form-group">
                <label>اسم السماد</label>
                <input type="text" class="form-control inv-name" placeholder="مثلاً: يوريا">
            </div>
             <div class="form-group">
                <label>السعر (للكيس)</label>
                <input type="number" class="form-control inv-price" placeholder="ريال">
            </div>
             <div class="form-group">
                <button class="btn btn-danger btn-small" onclick="this.closest('.fertilizer-item').remove()">حذف</button>
            </div>
        </div>
        <div class="grid-4 mt-10">
             <div class="input-with-unit"><div class="unit">N%</div><input type="number" class="form-control inv-n" placeholder="0"></div>
             <div class="input-with-unit"><div class="unit">P%</div><input type="number" class="form-control inv-p" placeholder="0"></div>
             <div class="input-with-unit"><div class="unit">K%</div><input type="number" class="form-control inv-k" placeholder="0"></div>
             <div class="input-with-unit"><div class="unit">وزن</div><input type="number" class="form-control inv-w" value="50"></div>
        </div>
        <div class="grid-4 mt-10" style="background:#f9f9f9; padding:5px; border-radius:4px;">
             <div class="input-with-unit"><div class="unit">Ca%</div><input type="number" class="form-control inv-ca" placeholder="0"></div>
             <div class="input-with-unit"><div class="unit">Mg%</div><input type="number" class="form-control inv-mg" placeholder="0"></div>
             <div class="input-with-unit"><div class="unit">Fe%</div><input type="number" class="form-control inv-fe" placeholder="0"></div>
             <div class="input-with-unit"><div class="unit">Zn%</div><input type="number" class="form-control inv-zn" placeholder="0"></div>
             <!-- S is often with others, add specific field -->
             <div class="input-with-unit"><div class="unit">S%</div><input type="number" class="form-control inv-s" placeholder="0"></div>
        </div>
    `;
    document.getElementById('mix-inventory').appendChild(div);
}

/**
 * Calculates the best mix using a Generalized Greedy Algorithm.
 * Prioritizes: Micros (Fe, Zn) > Secondary (Ca, Mg) > Primary (P, K, N).
 */
function calculateSmartMix() {
    // 1. Gather Inventory
    const inventory = [];
    document.querySelectorAll('#mix-inventory .fertilizer-item').forEach(el => {
        inventory.push({
            name: el.querySelector('.inv-name').value || 'سماد غير مسمى',
            n: parseFloat(el.querySelector('.inv-n').value) || 0,
            p: parseFloat(el.querySelector('.inv-p').value) || 0,
            k: parseFloat(el.querySelector('.inv-k').value) || 0,
            ca: parseFloat(el.querySelector('.inv-ca').value) || 0,
            mg: parseFloat(el.querySelector('.inv-mg').value) || 0,
            s: parseFloat(el.querySelector('.inv-s').value) || 0,
            fe: parseFloat(el.querySelector('.inv-fe').value) || 0,
            zn: parseFloat(el.querySelector('.inv-zn').value) || 0,
            price: parseFloat(el.querySelector('.inv-price').value) || 0,
            weight: parseFloat(el.querySelector('.inv-w').value) || 50
        });
    });

    if (inventory.length === 0) {
        alert("يرجى إضافة أسمدة للمخزون أولاً!");
        return;
    }

    // 2. Targets (Needs)
    const val = (id) => parseFloat(document.getElementById(id) ? document.getElementById(id).value : 0) || 0;

    // We use a comprehensive object for needs
    let needs = {
        fe: val('bridge-need-fe'),
        zn: val('bridge-need-zn'),
        ca: val('bridge-need-ca'),
        mg: val('bridge-need-mg'),
        s: val('bridge-need-s'),
        p: val('bridge-need-p'),
        k: val('bridge-need-k'),
        n: val('bridge-need-n')
    };

    const resultMix = [];
    let totalCost = 0;

    // 3. Algorithm: Iterate by priority
    // Order matters! Harder to find nutrients come first.
    const priorityOrder = ['fe', 'zn', 'ca', 'mg', 's', 'p', 'k', 'n'];

    const findBestSource = (nutrient) => {
        let best = null;
        let minCost = Infinity;
        inventory.forEach(fert => {
            if (fert[nutrient] > 0) {
                // Cost per 1 unit (1%) of nutrient in a bag
                // Actual amount of nutrient in bag = weight * (content/100)
                const nutrientAmount = fert.weight * (fert[nutrient] / 100);
                const costPerUnit = fert.price / nutrientAmount;
                if (costPerUnit < minCost) {
                    minCost = costPerUnit;
                    best = fert;
                }
            }
        });
        return best;
    };

    priorityOrder.forEach(nut => {
        if (needs[nut] > 0) {
            const bestSource = findBestSource(nut);

            if (bestSource) {
                // Calculate amount needed of this fertilizer
                const contentPct = bestSource[nut];
                const amountFertilizer = needs[nut] / (contentPct / 100);

                // Add to mix
                resultMix.push({
                    fertilizer: bestSource,
                    amount: amountFertilizer,
                    reason: `تغطية عنصر ${nut.toUpperCase()}`
                });

                // Deduct ALL nutrients provided by this amount
                ['n', 'p', 'k', 'ca', 'mg', 's', 'fe', 'zn'].forEach(el => {
                    const provided = amountFertilizer * (bestSource[el] / 100);
                    needs[el] = Math.max(0, needs[el] - provided);
                });
            }
        }
    });

    // 4. Render Results
    const resArea = document.getElementById('mix-results-area');
    let html = `<h4>الخلطة الذكية المقترحة (شاملة العناصر)</h4>
               <table class="data-table">
               <thead><tr><th>السماد</th><th>الكمية (كجم)</th><th>عدد الأكياس</th><th>التكلفة</th><th>السبب</th></tr></thead>
               <tbody>`;

    if (resultMix.length === 0) {
        html += `<tr><td colspan="5" style="text-align:center;">لم يتم العثور على أسمدة مناسبة أو لا توجد احتياجات!</td></tr>`;
    }

    // Consolidated Results (Merge duplicates)
    const mergedMix = {};
    resultMix.forEach(item => {
        const name = item.fertilizer.name;
        if (!mergedMix[name]) {
            mergedMix[name] = { ...item, reasons: [item.reason] };
        } else {
            mergedMix[name].amount += item.amount;
            if (!mergedMix[name].reasons.includes(item.reason)) mergedMix[name].reasons.push(item.reason);
        }
    });

    Object.values(mergedMix).forEach(item => {
        const bags = Math.ceil(item.amount / item.fertilizer.weight);
        const cost = bags * item.fertilizer.price;
        totalCost += cost;

        html += `<tr>
            <td><strong>${item.fertilizer.name}</strong></td>
            <td>${Math.ceil(item.amount)}</td>
            <td>${bags} <small>(${item.fertilizer.weight} كجم)</small></td>
            <td>${cost.toLocaleString()} ريال</td>
            <td><span class="status-badge status-success">${item.reasons.join(' + ')}</span></td>
        </tr>`;
    });

    html += `</tbody></table>
             <div class="result-card mt-20" style="background:#e8f5e9; border:1px solid #c8e6c9;">
                <h4>الإجمالي التقديري</h4>
                <div class="result-value" style="color:#2e7d32;">${totalCost.toLocaleString()} ريال</div>
             </div>`;

    resArea.innerHTML = html;
    resArea.style.display = 'block';
}

/**
 * Calculates the "Best Fit" fertilizer from the inventory.
 * Strategy: Find the single fertilizer that matches the required Ratio (N:P:K) most closely,
 * minimizing waste and complexity.
 */
function calculateBestFitMix() {
    // 1. Gather Inventory (Reuse logic)
    const inventory = [];
    document.querySelectorAll('#mix-inventory .fertilizer-item').forEach(el => {
        inventory.push({
            name: el.querySelector('.inv-name').value || 'سماد غير مسمى',
            n: parseFloat(el.querySelector('.inv-n').value) || 0,
            p: parseFloat(el.querySelector('.inv-p').value) || 0,
            k: parseFloat(el.querySelector('.inv-k').value) || 0,
            price: parseFloat(el.querySelector('.inv-price').value) || 0,
            weight: parseFloat(el.querySelector('.inv-w').value) || 50
        });
    });

    if (inventory.length === 0) {
        alert("يرجى إضافة أسمدة للمخزون للمقارنة!");
        return;
    }

    // 2. Targets
    const reqN = parseFloat(document.getElementById('bridge-need-n').value) || 0;
    const reqP = parseFloat(document.getElementById('bridge-need-p').value) || 0;
    const reqK = parseFloat(document.getElementById('bridge-need-k').value) || 0;

    if (reqN + reqP + reqK === 0) {
        alert("لا توجد احتياجات مسجلة للمقارنة!");
        return;
    }

    // 3. Logic: Analyze each fertilizer
    const analysis = inventory.map(fert => {
        // A. Coverage Calculation: How much of this fert is needed to cover the "Dominant" requirement?

        let amountN = (fert.n > 0) ? (reqN / (fert.n / 100)) : Infinity;
        let amountP = (fert.p > 0) ? (reqP / (fert.p / 100)) : Infinity;
        let amountK = (fert.k > 0) ? (reqK / (fert.k / 100)) : Infinity;

        // Consider only elements we actually need and fert actually has
        const validAmounts = [];
        if (reqN > 0 && fert.n > 0) validAmounts.push(amountN);
        if (reqP > 0 && fert.p > 0) validAmounts.push(amountP);
        if (reqK > 0 && fert.k > 0) validAmounts.push(amountK);

        // If it can't satisfy ANY required element, it's useless
        if (validAmounts.length === 0) {
            return { ...fert, score: -1, reason: "لا يحتوي على العناصر المطلوبة" };
        }

        const proposedAmount = Math.max(...validAmounts); // Amount to cover the most demanding element (Max avoids deficit)
        const bags = Math.ceil(proposedAmount / fert.weight);
        const totalCost = bags * fert.price;

        // B. Waste/Deficit Calculation
        const suppliedN = proposedAmount * (fert.n / 100);
        const suppliedP = proposedAmount * (fert.p / 100);
        const suppliedK = proposedAmount * (fert.k / 100);

        const diffN = suppliedN - reqN; // Positive = Surplus (Waste), Negative = Deficit
        const diffP = suppliedP - reqP;
        const diffK = suppliedK - reqK;

        // Deficit is BAD (missing requirements). Waste is OK-ish but inefficient.
        // We only care about Deficit for elements we NEED. 
        // If diff is negative but we didn't need it? (e.g. Req=0, Supplied=0, Diff=0). If Req=100, Supplied=0, Diff=-100.

        const totalDeficit = Math.max(0, -diffN) + Math.max(0, -diffP) + Math.max(0, -diffK);

        // C. Ratio Similarity (Cosine Similarity for N-P-K vectors)
        const dotProduct = (reqN * fert.n) + (reqP * fert.p) + (reqK * fert.k);
        const magReq = Math.sqrt(reqN * reqN + reqP * reqP + reqK * reqK);
        const magFert = Math.sqrt(fert.n * fert.n + fert.p * fert.p + fert.k * fert.k);
        let similarity = 0;
        if (magReq > 0 && magFert > 0) {
            similarity = dotProduct / (magReq * magFert);
        }

        // D. Scoring
        let score = (similarity * 100);

        // Penalize missing elements heavily
        if (reqN > 0 && fert.n === 0) score -= 30;
        if (reqP > 0 && fert.p === 0) score -= 30;
        if (reqK > 0 && fert.k === 0) score -= 30;

        // Penalize High Cost (Normalize cost? Hard to normalize without max cost. Just used as tie breaker manually below).
        // Let's rely on Similarity heavily as per user request (Ratio Match).

        return {
            ...fert,
            score,
            similarity,
            proposedAmount,
            bags,
            totalCost,
            waste: { N: diffN, P: diffP, K: diffK },
            deficit: totalDeficit
        };
    });

    // Sort by Score Descending
    analysis.sort((a, b) => b.score - a.score);

    // 4. Generate Detailed Report
    const best = analysis[0];
    const runnerUp = analysis[1];

    const resArea = document.getElementById('best-fit-results-area');
    resArea.innerHTML = `
        <h3 style="color:#673ab7; display:flex; align-items:center;">
            <i class="fas fa-crown" style="margin-left:10px;"></i> الخيار الأنسب (Best Fit)
        </h3>
        
        <div class="result-card" style="border-right:5px solid #673ab7; background:white;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap;">
                <h2 style="margin:0; color:#4a148c;">${best.name}</h2>
                <span class="status-badge" style="background:#ede7f6; color:#673ab7;">تطابق في النسب ${(best.similarity * 100).toFixed(1)}%</span>
            </div>
            
            <div class="grid-3" style="margin-top:15px; text-align:center;">
                <div class="p-10" style="background:#f5f5f5; border-radius:8px;">
                    <label style="display:block; color:#666;">الكمية المقترحة</label>
                    <div style="font-weight:bold; font-size:1.2em;">${Math.ceil(best.proposedAmount)} كجم</div>
                </div>
                <div class="p-10" style="background:#f5f5f5; border-radius:8px;">
                     <label style="display:block; color:#666;">عدد الأكياس</label>
                    <div style="font-weight:bold; font-size:1.2em;">${best.bags}</div>
                </div>
                <div class="p-10" style="background:#e8f5e9; border:1px solid #c8e6c9; border-radius:8px;">
                     <label style="display:block; color:#2e7d32;">التكلفة التقديرية</label>
                    <div style="font-weight:bold; font-size:1.2em; color:#2e7d32;">${best.totalCost.toLocaleString()} ريال</div>
                </div>
            </div>

            <div style="margin-top:15px; background:white; padding:15px; border:1px solid #eee; border-radius:5px;">
                <h5 style="margin:0 0 10px 0; color:#4527a0;">📊 لماذا اخترنا هذا السماد؟ (التقرير التفصيلي)</h5>
                <ul style="font-size:0.95em; color:#444; line-height:1.8;">
                    <li><strong>تطابق التركيبة (Ratio Match):</strong> نسبة N-P-K في هذا السماد تتطابق بنسبة <strong>${(best.similarity * 100).toFixed(1)}%</strong> مع احتياجات مزرعتك. هذا يعني توازن ممتاز وتقليل للهدر.</li>
                    
                    <li><strong>التغطية (Coverage):</strong> باستخدام ${Math.ceil(best.proposedAmount)} كجم، أنت تغطي احتياجاتك بنسبة كاملة للعناصر الأساسية.
                        ${best.deficit > 1 ? `<span style="color:#d32f2f;">(يوجد عجز بسيط قدره ${best.deficit.toFixed(0)} كجم في بعض العناصر، قد تحتاج لإضافتها بشكل منفصل)</span>` : '<span style="color:#2e7d32;">(تغطية شاملة دون عجز يذكر)</span>'}
                    </li>
                    
                    ${best.waste.N > 20 || best.waste.P > 20 || best.waste.K > 20 ?
            `<li><strong>ملاحظة هامة:</strong> قد يكون هناك فائض في بعض العناصر لضمان تلبية احتياج العنصر الأكبر (وهو أمر طبيعي في الأسمدة المركبة).</li>` :
            `<li><strong>كفاءة عالية:</strong> الكمية متوازنة جداً مع الحد الأدنى من الهدر.</li>`
        }
                </ul>
            </div>
        </div>

        ${runnerUp ? `
        <div style="margin-top:15px;">
            <details>
                <summary style="cursor:pointer; color:#7e57c2; font-weight:bold;">عرض البديل الثاني (${runnerUp.name})</summary>
                <div style="padding:10px; border:1px solid #eee; margin-top:5px; background:white; border-radius:4px;">
                    <p style="margin:5px 0;"><strong>${runnerUp.name}</strong> يأتي في المرتبة الثانية.</p>
                    <ul style="font-size:0.9em; color:#555;">
                        <li>نسبة التطابق: ${(runnerUp.similarity * 100).toFixed(1)}%</li>
                        <li>التكلفة: ${runnerUp.totalCost.toLocaleString()} ريال (${runnerUp.bags} كيس)</li>
                        <li>الفرق: هذا البديل أقل تطابقاً أو أغلى سعراً من الخيار الأول.</li>
                    </ul>
                </div>
            </details>
        </div>
        ` : ''}
    `;

    // Hide Greedy Results Logic
    const mixArea = document.getElementById('mix-results-area');
    if (mixArea) mixArea.style.display = 'none';
    resArea.style.display = 'block';
}
