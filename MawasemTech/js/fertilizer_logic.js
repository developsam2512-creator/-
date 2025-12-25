/**
 * fertilizer_logic.js
 * Contains the FertilizerCalculator class and UI bridging logic.
 */

class FertilizerCalculator {

    constructor() {
        this.knowledgeBase = FERTILIZER_KNOWLEDGE_BASE;
        this.calculationMode = 'basic';
        this.confidenceLevel = 0.7;
    }

    generateEmergencyPlan(normalRecs, inputs, netNeeds) {
        const essentialNutrients = ['N', 'P2O5', 'K2O'];
        const createPlan = (keepFactor, label, note) => {
            // Include ALL nutrients now (N, P, K, Ca, Mg, S, Fe, Zn)
            const plan = normalRecs
                // .filter(r => essentialNutrients.includes(r.nutrient)) // REMOVED FILTER
                .map(r => ({
                    ...r,
                    actualAmount: r.actualAmount * keepFactor,
                    cost: r.cost ? (r.cost * keepFactor) : 0,
                    fertilizer: r.fertilizer + ` (${label})`,
                    note: note
                }));

            // Calculate implied needs for this plan (now including secondary and micros)
            let impliedNeeds = { N: 0, P2O5: 0, K2O: 0, CaO: 0, MgO: 0, S: 0, Fe: 0, Zn: 0 };
            if (netNeeds) {
                impliedNeeds.N = (netNeeds.N || 0) * keepFactor;
                impliedNeeds.P2O5 = (netNeeds.P2O5 || 0) * keepFactor;
                impliedNeeds.K2O = (netNeeds.K2O || 0) * keepFactor;
                impliedNeeds.CaO = (netNeeds.CaO || 0) * keepFactor;
                impliedNeeds.MgO = (netNeeds.MgO || 0) * keepFactor;
                impliedNeeds.S = (netNeeds.S || 0) * keepFactor;
                impliedNeeds.Fe = (netNeeds.Fe || 0) * keepFactor;
                impliedNeeds.Zn = (netNeeds.Zn || 0) * keepFactor;
            }
            return { recommendations: plan, impliedNeeds: impliedNeeds };
        };

        const moderate = createPlan(0.6, 'اقتصادي', 'توفير 40% (خيار متوازن)');
        const extreme = createPlan(0.4, 'توفير قصوى', 'توفير 60% (للظروف الصعبة جداً)');

        const priorities = [
            'التركيز الكامل على عنصر النيتروجين (اليوريا) في الشهرين الأولين.',
            'تخفيض أو إلغاء التسميد الفوسفاتي إذا سبق إضافته.',
            'الري المنتظم أهم من التسميد في ظروف الإجهاد.',
            'استخدام الرش الورقي للعناصر الصغرى بدلاً من الإضافة الأرضية.'
        ];

        const extremePriorities = [
            ...priorities,
            'تجاهل البوتاسيوم تماماً في المراحل الأولى.',
            'الاعتماد كلياً على النيتروجين الأرخص (يوريا).',
            'تقليل عدد مرات التسميد للنصف لتوفير العمالة.'
        ];

        return {
            moderate: { ...moderate, priorities: priorities, saving: '40%' },
            extreme: { ...extreme, priorities: extremePriorities, saving: '60%' }
        };
    }

    // ===========================================
    // 🧠 Smart Context Analyzer Logic (New)
    // ===========================================
    analyzeContext(inputs, crop, area_ha) {
        const alerts = [];

        // 1. Efficiency Analysis (Soil x Irrigation)
        if (inputs.soilType === 'sandy' && inputs.irrigation === 'flood') {
            alerts.push({
                type: 'critical',
                title: 'خطر هدر الأسمدة',
                message: 'استخدام الري بالغمر في تربة رملية يؤدي لغسيل 70% من الأسمدة.',
                recommendation: 'يجب التحول للري بالتنقيط فوراً أو تقسيم السماد إلى 10-15 دفعة صغيرة جداً.'
            });
        }

        // 2. Density Analysis (Trees)
        if (crop.type === 'tree' && inputs.treeCount > 0 && area_ha > 0) {
            const treesPerHectare = inputs.treeCount / area_ha;

            // Calculate display density based on USER'S unit
            let displayDensity = treesPerHectare;
            let displayUnit = 'هكتار';

            if (inputs.areaUnit === 'dunam') {
                displayDensity = treesPerHectare / 10; // 1 Ha = 10 Dunams
                displayUnit = 'دونم';
            } else if (inputs.areaUnit === 'acre') {
                displayDensity = treesPerHectare / 2.471;
                displayUnit = 'فدان';
            }

            // Threshold: > 600 trees/ha is generally high (except for intensive systems)
            // 600 trees/ha = 60 trees/dunam
            if (treesPerHectare > 600) {
                alerts.push({
                    type: 'warning',
                    title: 'كثافة زراعية عالية',
                    message: `عدد الأشجار (${Math.round(displayDensity)}/${displayUnit}) مرتفع جداً، مما يخلق تنافساً على الغذاء.`,
                    recommendation: 'يجب زيادة كميات البوتاسيوم بنسبة 15% لتعزيز الصلابة، والتركيز على التقليم لضمان دخول الضوء.'
                });
            }
        }

        // 3. Climate x Cultivation Context
        const isHot = inputs.climate === 'desert' || inputs.climate === 'hot';
        const isOpenField = inputs.cultivationType === 'open';
        const sensitiveCrops = ['tomato', 'cucumber', 'pepper', 'strawberry'];

        if (isHot && isOpenField && sensitiveCrops.includes(inputs.crop)) {
            alerts.push({
                type: 'warning',
                title: 'إجهاد حراري متوقع',
                message: 'زراعة هذا المحصول الحساس في حقل مكشوف مع أجوائنا الحارة يقلل الامتصاص.',
                recommendation: 'تجنب التسميد وقت الظهيرة تماماً. استخدم "نترات البوتاسيوم" لرفع مقاومة النبات للجفاف والحرارة.'
            });
        }

        // 4. Salinity Risk
        if (inputs.soilType === 'clay' && inputs.irrigation === 'flood' && isHot) {
            alerts.push({
                type: 'info',
                title: 'خطر تملح التربة',
                message: 'الري بالغمر في الطين مع الحرارة يؤدي لتبخر عالي وتراكم الأملاح.',
                recommendation: 'يفضل إجراء "رية غسيل" بدون سماد كل 4 ريات لتقليل الملوحة حول الجذور.'
            });
        }

        return alerts;
    }

    calculate(inputs) {
        let result;
        switch (inputs.mode) {
            case 'basic': result = this.calculateBasic(inputs); break;
            case 'intermediate': result = this.calculateIntermediate(inputs); break;
            case 'advanced': result = this.calculateAdvanced(inputs); break;
            default: result = this.calculateBasic(inputs);
        }
        if (!result.emergencyPlan && result.fertilizerRecommendations) {
            // Need netNeeds for accurate emergency planning
            const netNeeds = result.netNeeds;
            result.emergencyPlan = this.generateEmergencyPlan(result.fertilizerRecommendations, inputs, netNeeds);
        }
        return result;
    }

    calculateBasic(inputs) {
        const startTime = Date.now();
        if (!this.validateBasicInputs(inputs)) throw new Error('بيانات غير كافية للوضع البسيط.');

        const crop = this.knowledgeBase.CROPS[inputs.crop];
        if (!crop) throw new Error('المحصول غير موجود');

        const area_ha = this.convertAreaToHectares(inputs.area, inputs.areaUnit);

        // 1. Calculate Base Needs
        // Inject new UI inputs into 'inputs' object implicitly or read DOM if missing?
        // Better to update saveFormData to capture them, but here we can check DOM fallback

        // Fix: logic expects inputs passed in argument. UI gathering logic happens before calling calculate.
        // We need to ensure UI gathering captures 'growth-stage-basic' and 'current-season-basic'.

        // Let's assume the UI gatherer (saveFormData/UI caller) will be updated or we read directly here as patch
        if (!inputs.phenologyStage && document.getElementById('growth-stage-basic')) {
            inputs.phenologyStage = document.getElementById('growth-stage-basic').value;
        }
        if (!inputs.phenologyStage && document.getElementById('growth-stage-intermediate')) {
            inputs.phenologyStage = document.getElementById('growth-stage-intermediate').value;
        }

        if (!inputs.season && document.getElementById('current-season-basic')) {
            inputs.season = document.getElementById('current-season-basic').value;
        }

        let baseNeeds = this.calculateBasicNeeds(crop, area_ha, inputs);

        // 2. Apply Greenhouse Factor
        if (inputs.cultivationType === 'greenhouse') {
            for (let k in baseNeeds) baseNeeds[k] *= 1.4;
        }

        // 3. Apply Tree Age Factor
        let ageFactor = 1;
        if (crop.type === 'tree' && inputs.treeAge) {
            ageFactor = this.knowledgeBase.CORRECTION_FACTORS.AGE_FACTORS[inputs.treeAge] || 1;
            for (let k in baseNeeds) baseNeeds[k] *= ageFactor;
        }

        // 4. Other Corrections
        const adjustedNeeds = this.applyBasicCorrections(baseNeeds, inputs);

        // 5. Calculate Fertilizers
        const fertilizerRequirements = this.calculateFertilizerAmounts(adjustedNeeds, inputs);

        // 6. Per Tree Dosage
        // 6. Per Unit Dosage (Tree or Plant)
        if (crop.type === 'tree' && inputs.treeCount > 0) {
            fertilizerRequirements.recommendations.forEach(rec => {
                rec.perTreeAmount = ((rec.actualAmount * 1000) / inputs.treeCount).toFixed(0);
                rec.perTreeUnit = 'جرام'; // Per Tree
            });
        } else if (crop.type === 'field' && inputs.plantDensity > 0) {
            const totalPlants = inputs.plantDensity * inputs.area;
            if (totalPlants > 0) {
                fertilizerRequirements.recommendations.forEach(rec => {
                    rec.perTreeAmount = ((rec.actualAmount * 1000) / totalPlants).toFixed(1); // Per Plant
                    rec.perTreeUnit = 'جرام/نبات';
                });
            }
        }

        // 7. Auto-Analyze Context (Smart Logic)
        const smartAnalysis = this.analyzeContext(inputs, crop, area_ha);

        this.confidenceLevel = this.calculateConfidenceLevel(inputs, 'basic');
        const emergencyPlan = this.generateEmergencyPlan(fertilizerRequirements.recommendations, inputs, adjustedNeeds);

        return {
            success: true, mode: 'basic', crop: crop.name,
            area: { value: inputs.area, unit: inputs.areaUnit, hectares: area_ha },
            soilType: inputs.soilType, irrigation: inputs.irrigation,
            cultivationType: inputs.cultivationType,
            treeDetails: crop.type === 'tree' ? { count: inputs.treeCount, age: inputs.treeAge, factor: ageFactor, phenology: inputs.phenologyStage } : null,
            fieldDetails: crop.type === 'field' ? { density: inputs.plantDensity, plantingDate: inputs.plantingDate, stage: inputs.growthStage } : null,
            fertilizerRecommendations: fertilizerRequirements.recommendations,
            applicationSchedule: this.generateBasicSchedule(fertilizerRequirements, crop, inputs),
            costEstimation: fertilizerRequirements.costEstimation,
            confidence: this.confidenceLevel,
            warnings: this.generateBasicWarnings(inputs, crop),
            tips: this.generateBasicTips(inputs, crop),
            smartAnalysis: smartAnalysis,
            netNeeds: adjustedNeeds,
            emergencyPlan: emergencyPlan
        };
    }

    calculateIntermediate(inputs) {
        if (!this.validateBasicInputs(inputs)) throw new Error('بيانات غير كافية للوضع المتوسط');

        const crop = this.knowledgeBase.CROPS[inputs.crop];
        if (!crop) throw new Error('المحصول غير موجود');
        const area_ha = this.convertAreaToHectares(inputs.area, inputs.areaUnit);

        // 1. Start with Basic Needs
        let netNeeds = this.calculateBasicNeeds(crop, area_ha, inputs);

        // 2. Apply Soil Test Credits (The Intermediate Core Feature)
        const ppmToKg = 2.24;

        if (inputs.soilN) {
            const availableN = inputs.soilN * ppmToKg * area_ha * 0.5;
            netNeeds.N = Math.max(0, netNeeds.N - availableN);
        }
        if (inputs.soilP) {
            const availableP = inputs.soilP * ppmToKg * area_ha * 0.3;
            const availableP2O5 = availableP * 2.29;
            netNeeds.P2O5 = Math.max(0, netNeeds.P2O5 - availableP2O5);
        }
        if (inputs.soilK) {
            const availableK = inputs.soilK * ppmToKg * area_ha * 0.6;
            const availableK2O = availableK * 1.205;
            netNeeds.K2O = Math.max(0, netNeeds.K2O - availableK2O);
        }

        // 3. Apply Organic Matter Credit
        if (inputs.organicMatter > 0) {
            const omCreditN = inputs.organicMatter * 20 * area_ha;
            netNeeds.N = Math.max(0, netNeeds.N - omCreditN);
        }

        // 4. Standard Corrections
        const adjustedNeeds = this.applyBasicCorrections(netNeeds, inputs);

        // 5. Apply Tree Logic
        let ageFactor = 1;
        if (crop.type === 'tree' && inputs.treeAge) {
            ageFactor = this.knowledgeBase.CORRECTION_FACTORS.AGE_FACTORS[inputs.treeAge] || 1;
            for (let k in adjustedNeeds) adjustedNeeds[k] *= ageFactor;
        }

        // 6. Calculate Fertilizers
        const fertilizerRequirements = this.calculateFertilizerAmounts(adjustedNeeds, inputs);

        // 7. Per Tree Dosage
        // 7. Per Unit Dosage (Tree or Plant)
        if (crop.type === 'tree' && inputs.treeCount > 0) {
            fertilizerRequirements.recommendations.forEach(rec => {
                rec.perTreeAmount = ((rec.actualAmount * 1000) / inputs.treeCount).toFixed(0);
                rec.perTreeUnit = 'جرام';
            });
        } else if (crop.type === 'field' && inputs.plantDensity > 0) {
            const totalPlants = inputs.plantDensity * inputs.area;
            if (totalPlants > 0) {
                fertilizerRequirements.recommendations.forEach(rec => {
                    rec.perTreeAmount = ((rec.actualAmount * 1000) / totalPlants).toFixed(1);
                    rec.perTreeUnit = 'جرام/نبات';
                });
            }
        }

        // 8. Smart Analysis
        const smartAnalysis = this.analyzeContext(inputs, crop, area_ha);

        if (inputs.organicMatter < 1) {
            smartAnalysis.push({
                type: 'warning',
                title: 'فقر المادة العضوية',
                message: 'نسبة المادة العضوية منخفضة جداً (<1%)، مما يقلل فاعلية الأسمدة.',
                recommendation: 'أضف سماد بلدي أو كمبوست لرفع الكفاءة.'
            });
        } else {
            smartAnalysis.push({
                type: 'info',
                title: 'توفير ذكي',
                message: `بناءً على تحليل التربة والمادة العضوية، تم تقليل الكميات لتوفير المال وتجنب التسمم السمادي.`,
                recommendation: 'اعتمد هذه الكميات المخفضة بثقة.'
            });
        }

        this.confidenceLevel = 0.85;
        const emergencyPlan = this.generateEmergencyPlan(fertilizerRequirements.recommendations, inputs, adjustedNeeds);

        return {
            success: true, mode: 'intermediate', crop: crop.name,
            area: { value: inputs.area, unit: inputs.areaUnit, hectares: area_ha },
            soilType: inputs.soilType, irrigation: inputs.irrigation,
            cultivationType: inputs.cultivationType,
            treeDetails: crop.type === 'tree' ? { count: inputs.treeCount, age: inputs.treeAge } : null,
            fertilizerRecommendations: fertilizerRequirements.recommendations,
            applicationSchedule: this.generateBasicSchedule(fertilizerRequirements, crop, inputs),
            costEstimation: fertilizerRequirements.costEstimation,
            confidence: this.confidenceLevel,
            warnings: this.generateBasicWarnings(inputs, crop),
            smartAnalysis: smartAnalysis,
            netNeeds: adjustedNeeds,
            emergencyPlan: emergencyPlan
        };
    }

    calculateAdvanced(inputs) {
        if (!inputs.crop || !inputs.area || !inputs.soilN) throw new Error('يرجى إدخال بيانات المحصول وتحليل التربة الأساسي (N, P, K).');

        const crop = this.knowledgeBase.CROPS[inputs.crop];
        // Note: Advanced mode currently uses 'crop-variety' select which might be empty if not populated. 
        // Assuming user populates it or we map it. For now, we use existing crops.

        const area_ha = this.convertAreaToHectares(inputs.area, inputs.areaUnit);
        const smartAnalysis = []; // Initialize early to allow logging issues during calculation

        // 1. Base Needs & Yield Adjustment
        let baseNeeds = this.calculateBasicNeeds(crop, area_ha, inputs);

        // Adjust for Target Yield
        if (inputs.targetYield === 'high') {
            for (let k in baseNeeds) baseNeeds[k] *= 1.2; // +20% for High Target
        } else if (inputs.targetYield === 'max') {
            for (let k in baseNeeds) baseNeeds[k] *= 1.4; // +40% for Max Potential
        }

        // Seasonal Adjustment
        if (inputs.season) {
            const seasonalRules = this.knowledgeBase.SEASONAL_RULES[inputs.season];
            if (seasonalRules) {
                if (seasonalRules.N) baseNeeds.N *= seasonalRules.N;
                if (seasonalRules.P) baseNeeds.P2O5 *= seasonalRules.P;
                if (seasonalRules.K) baseNeeds.K2O *= seasonalRules.K;
                if (seasonalRules.description && smartAnalysis) {
                    smartAnalysis.push({ type: 'info', title: 'تعديل موسمي', message: seasonalRules.description });
                }
            }
        }

        // Adjust for Previous Season (Recovery)
        if (inputs.previousYieldStatus === 'heavy' && baseNeeds.K2O) {
            baseNeeds.K2O *= 1.25; // Boost K for recovery
        }

        // Density Check (moved from placeholder)
        if (inputs.plantDensity > 0 && crop.type === 'field') {
            // Logic placeholder
        }

        // 2. Precise Soil Nutrient Accounting
        // Use exact ppm to kg/ha conversion. 
        // Factor 2.24 is for 2 million lbs/acre slice (6 inches). 30cm depth is ~4 million kg/ha soil.
        // ppm * 4 is lighter approximation. Let's stick to 2.24 * 1.5 (~3.36 for 30cm) for now or allow config.
        const conversionFactor = 3.0; // Approximation for 30cm root zone

        if (inputs.soilN) baseNeeds.N = Math.max(0, baseNeeds.N - (inputs.soilN * conversionFactor * area_ha * 0.5));
        if (inputs.soilP) {
            const P_kg = inputs.soilP * conversionFactor * area_ha * 0.4; // 40% availability
            baseNeeds.P2O5 = Math.max(0, baseNeeds.P2O5 - (P_kg * 2.29));
        }
        if (inputs.soilK) {
            const K_kg = inputs.soilK * conversionFactor * area_ha * 0.7; // 70% availability
            baseNeeds.K2O = Math.max(0, baseNeeds.K2O - (K_kg * 1.2));
        }

        // 3. Correction & Fertilizer Calculation
        const adjustedNeeds = this.applyBasicCorrections(baseNeeds, inputs);
        const fertilizerRequirements = this.calculateFertilizerAmounts(adjustedNeeds, inputs);

        // 4. Advanced Analysis (Micros, pH, Balancing)
        const standards = this.knowledgeBase.ADVANCED_STANDARDS;

        // Micronutrients Check (Updated for Golden Data Structure)
        // Micronutrients Check (Updated for Golden Data Structure with Dynamic Gap Analysis)
        const userMicros = { Fe: inputs.Fe, Zn: inputs.Zn, Mn: inputs.Mn, B: inputs.B, Cu: inputs.Cu };
        for (const [el, val] of Object.entries(userMicros)) {
            if (val === undefined || val === null || val === '') continue;

            const nutrientStd = standards.SOIL_NUTRIENTS[el];
            if (!nutrientStd) continue;

            const low = nutrientStd.low;
            const high = nutrientStd.high;

            // Get crop need (Handle both Golden Model Object and Legacy Number)
            let cropNeedVar = crop.micronutrients && crop.micronutrients[el];
            let cropNeedAmount = 0;
            let cropNeedImportance = "غير محدد";

            if (typeof cropNeedVar === 'object') {
                cropNeedAmount = cropNeedVar.optimal || 0;
                cropNeedImportance = cropNeedVar.importance || "متوسطة";
            } else if (typeof cropNeedVar === 'number') {
                cropNeedAmount = cropNeedVar;
            } else {
                // Fallback if data missing in crop
                cropNeedAmount = (el === 'Fe') ? 1000 : 500; // Default fallback (grams)
            }

            // Calculate Factor based on soil level
            let factor = 0;
            let statusByType = '';
            let note = '';

            if (val < low) {
                // Deficiency: Scale from 1.0x to 1.5x based on severity
                // If val is 0, severity is 1, factor is 1.5
                // If val is close to low, severity is near 0, factor is 1.0
                const severity = (low - val) / low;
                factor = 1.0 + (severity * 0.5);
                statusByType = 'warning';

                smartAnalysis.push({
                    type: 'warning',
                    title: `نقص عنصر ${el}`,
                    message: `مستوى ${el} بالتربة (${val} ppm) منخفض جداً عن الحد الحرج (${low}). (عامل التصحيح: ${(factor).toFixed(2)}x). الأهمية: ${cropNeedImportance}.`,
                    recommendation: `يجب إضافة جرعات تصحيحية مكثفة من ${el} (يفضل رش ورقي).`
                });
                note = 'جرعة تصحيحية';

            } else if (val >= low && val < high) {
                // Sufficient: Maintenance Dose (0.5x)
                // This ensures the user sees a "Maintenance" recommendation rather than nothing
                factor = 0.5;
                statusByType = 'info';

                // Only add Info note if it's a critical nutrient
                if (cropNeedImportance === 'عالية') {
                    smartAnalysis.push({
                        type: 'info',
                        title: `مستوى عنصر ${el} جيد`,
                        message: `مستوى ${el} بالتربة (${val} ppm) في النطاق المثالي.`,
                        recommendation: `يوصى بإضافة جرعة صيانة (50% من احتياج المحصول) لضمان عدم حدوث نقص مستقبلاً.`
                    });
                }
                note = 'جرعة صيانة';

            } else {
                // High: No Application
                factor = 0;
                statusByType = 'success';
                // No card needed, maybe just a note?
                // If very high, warn about toxicity?
                if (val > high * 2) {
                    smartAnalysis.push({
                        type: 'warning',
                        title: `سمية محتملة لعنصر ${el}`,
                        message: `مستوى ${el} مرتفع جداً (${val} ppm).`,
                        recommendation: 'تجنب إضافة أي أسمدة تحتوي على هذا العنصر.'
                    });
                }
            }

            if (factor > 0 && cropNeedAmount > 0) {
                const amountKg = (cropNeedAmount / 1000) * factor; // Convert grams to kg * factor

                fertilizerRequirements.recommendations.push({
                    nutrient: el,
                    fertilizer: `مخلب ${el}`,
                    actualAmount: amountKg,
                    requiredAmount: amountKg,
                    efficiency: 0.9, // Foliar efficiency
                    unit: 'kg',
                    cost: amountKg * 150, // Approx price
                    applicationMethod: 'رش ورقي',
                    grade: 'Chelated',
                    importance: cropNeedImportance,
                    note: note
                });
            }
        }

        // ==========================================
        // 🔬 Micro-Nutrients Logic (Liebig's Law)
        // ==========================================
        const micros = ['Fe', 'Zn', 'Mn', 'Cu', 'B'];
        micros.forEach(micro => {
            // 1. Get Target from Crop Data
            // Fix: Access using proper case key (Fe, Zn) not lowercase
            const targetObj = (crop.micronutrients && crop.micronutrients[micro]);
            const targetNeed = (targetObj && targetObj.optimal) ? targetObj.optimal : 0; // grams/ha

            // 2. Logic: If no target data, skip
            if (targetNeed > 0) {
                // 3. Inputs: Get soil analysis in ppm
                const soilVal = inputs[micro] || 0; // e.g., inputs.Fe

                // 4. Coefficient: Convert ppm to kg/ha then to grams/ha (approx 1 ppm = 2 kg/ha = 2000 g/ha for 15cm depth)
                // However, availability is pH dependent.
                let availabilityFactor = 1.0;
                if (inputs.ph > 7.5) availabilityFactor = 0.5; // Alkaline soil locks micros

                const soilSupply = soilVal * 2000 * availabilityFactor; // Grams per Hectare supplied by soil

                // 5. Gap Analysis (Liebig's Law)
                let deficit = targetNeed - soilSupply;

                // Smart Defaults: If user didn't input anything (val=0), assume moderate deficiency (provide 50% of need)
                if (soilVal === 0 && !inputs[micro]) {
                    deficit = targetNeed * 0.5;
                }

                if (deficit > 0) {
                    // Update main needs object
                    adjustedNeeds[micro] = deficit / 1000; // Store in KG for consistency with macros

                    // Add Recommendation
                    let productName = `${micro}-Sulfate`;
                    let productGrade = 'Standard';
                    if (inputs.ph > 7.5 && (micro === 'Fe' || micro === 'Zn')) {
                        productName = `Chelated ${micro} (EDDHA/EDTA)`;
                        productGrade = 'High Efficiency';
                    }

                    const recAmount = deficit / 1000; // in KG
                    fertilizerRequirements.recommendations.push({
                        nutrient: micro,
                        amount: recAmount,
                        actualAmount: recAmount,
                        efficiency: availabilityFactor,
                        unit: 'kg',
                        cost: recAmount * 300, // Higher cost for micros
                        applicationMethod: 'رش ورقي / أرضي',
                        grade: productGrade,
                        importance: 'High (Limiting Factor)',
                        note: `النقص في عنصر ${micro} يحدد سقف الإنتاج. (قانون البرميل)`
                    });
                }
            }
        });

        // pH Logic (Updated to use Crop Specific Limits)
        if (inputs.ph) {
            let phMin = standards.PH_RULES.alkaline.min; // Default 7.5
            let phMax = standards.PH_RULES.acidic.max;   // Default 5.5
            let phNote = "";

            // Use Crop Specific Limits if available (Golden Model)
            if (crop.soil_requirements && crop.soil_requirements.ph) {
                phMin = crop.soil_requirements.ph.max || 7.5;
                phMax = crop.soil_requirements.ph.min || 5.5;
                if (inputs.ph > phMin) phNote = ` (الحد الأقصى للمحصول: ${phMin})`;
                if (inputs.ph < phMax) phNote = ` (الحد الأدنى للمحصول: ${phMax})`;
            } else if (crop.info && crop.info.pH_range) {
                // Legacy support
                phMin = crop.info.pH_range[1];
                phMax = crop.info.pH_range[0];
            }

            if (inputs.ph > phMin) {
                smartAnalysis.push({
                    type: 'warning',
                    title: 'قلوية التربة مرتفعة',
                    message: standards.PH_RULES.alkaline.message + phNote,
                    recommendation: 'استخدم أسمدة حامضية (مثل حامض الفوسفوريك) وأضف الكبريت الزراعي.'
                });
            } else if (inputs.ph < phMax) {
                smartAnalysis.push({
                    type: 'info',
                    title: 'حموضة التربة',
                    message: standards.PH_RULES.acidic.message + phNote,
                    recommendation: 'قد تحتاج لإضافة الجير الزراعي (Lime) لتعديل الحموضة.'
                });
            }
        }

        // Mulder's Chart (Balancing)
        // Need to convert inputs to comparable units (meq/100g is best, but we have ppm)
        // Approx: K ppm / 390 = meq, Mg ppm / 120 = meq (Mg input missing in advanced form? - assumed Mg deficiency check if we had it)
        // We can check P vs Zn
        if (inputs.soilP && inputs.Zn) {
            if (inputs.soilP > standards.SOIL_NUTRIENTS.P.high && inputs.Zn < standards.SOIL_NUTRIENTS.Zn.low * 1.5) {
                const interaction = standards.NUTRIENT_INTERACTIONS.find(x => x.source === 'P' && x.target === 'Zn');
                if (interaction) {
                    smartAnalysis.push({ type: 'critical', title: interaction.title, message: interaction.message, recommendation: 'يجب رش الزنك ورقياً حصراً لتجنب التثبيت في التربة.' });
                }
            }
        }

        // Per Unit Dosage (Tree or Plant)
        if (crop && crop.type === 'tree' && inputs.treeCount > 0) {
            fertilizerRequirements.recommendations.forEach(rec => {
                rec.perTreeAmount = ((rec.actualAmount * 1000) / inputs.treeCount).toFixed(0);
                rec.perTreeUnit = 'جرام';
            });
        } else if (crop && crop.type === 'field' && inputs.plantDensity > 0) {
            const totalPlants = inputs.plantDensity * inputs.area;
            if (totalPlants > 0) {
                fertilizerRequirements.recommendations.forEach(rec => {
                    rec.perTreeAmount = ((rec.actualAmount * 1000) / totalPlants).toFixed(1);
                    rec.perTreeUnit = 'جرام/نبات';
                });
            }
        }

        return {
            success: true, mode: 'advanced', crop: crop ? crop.name : inputs.crop,
            area: { value: inputs.area, unit: inputs.areaUnit },
            soilType: inputs.soilType, irrigation: inputs.irrigation,
            cultivationType: inputs.cultivationType,
            treeDetails: crop.type === 'tree' ? { count: inputs.treeCount, age: inputs.treeAge, phenology: inputs.phenologyStage } : null,
            fieldDetails: crop.type === 'field' ? { density: inputs.plantDensity, plantingDate: inputs.plantingDate, stage: inputs.growthStage } : null,
            fertilizerRecommendations: fertilizerRequirements.recommendations,
            applicationSchedule: this.generateBasicSchedule(fertilizerRequirements, crop, inputs),
            costEstimation: fertilizerRequirements.costEstimation,
            confidence: 0.98,
            warnings: this.generateBasicWarnings(inputs, crop),
            smartAnalysis: smartAnalysis,
            netNeeds: adjustedNeeds,
            emergencyPlan: this.generateEmergencyPlan(fertilizerRequirements.recommendations, inputs, adjustedNeeds)
        };
    }

    // Helpers
    validateBasicInputs(inputs) { return inputs.crop && inputs.area && inputs.soilType && inputs.irrigation; }
    convertAreaToHectares(area, unit) {
        const conversions = this.knowledgeBase.CONVERSIONS.AREA;
        const val = parseFloat(area);
        switch (unit) {
            case 'dunam': return val * conversions.dunam_to_hectare;
            case 'hectare': return val;
            case 'acre': return val * conversions.acre_to_hectare;
            default: return val;
        }
    }
    calculateBasicNeeds(crop, area_ha, inputs) {
        const optimalNeeds = crop.nutrientRequirements;
        const totalNeeds = {};

        // Determine specific stage if selected
        const stageKey = inputs.phenologyStage || inputs.growthStage;
        const stageData = (stageKey && crop.growthStages) ? crop.growthStages[stageKey] : null;

        for (const [nutrient, range] of Object.entries(optimalNeeds)) {
            let baseAmount = (range.optimal || 0) * area_ha;

            // If a specific stage is selected, apply its distribution ratio
            // If a specific stage is selected, apply its distribution ratio
            if (stageData) {
                if (stageData[nutrient] !== undefined) {
                    baseAmount = baseAmount * stageData[nutrient];
                } else {
                    // Stage exists but Nutrient is missing in stage config? Default to safety factor (20%)
                    // This prevents "Whole Year" fallbacks for forgotten secondary nutrients
                    baseAmount = baseAmount * 0.20;
                }
            } else if (stageKey && !stageData) {
                // Stage selected but data completely missing? Fallback to safety factor (25%)
                console.warn(`Stage ${stageKey} data missing for ${crop.name}. Defaulting to 25%.`);
                baseAmount = baseAmount * 0.25;
            }

            totalNeeds[nutrient] = baseAmount;
        }

        // Debug
        console.log(`Calculating Needs for Stage: ${stageKey || 'Annual'}`, totalNeeds);
        return totalNeeds;
    }
    applyBasicCorrections(baseNeeds, inputs) {
        const correctedNeeds = { ...baseNeeds };
        const factors = this.knowledgeBase.CORRECTION_FACTORS;
        if (inputs.soilType && factors.SOIL_EFFICIENCY[inputs.soilType]) {
            const soilFactor = factors.SOIL_EFFICIENCY[inputs.soilType];
            if (correctedNeeds.N) correctedNeeds.N /= soilFactor.N;
            if (correctedNeeds.P2O5) correctedNeeds.P2O5 /= soilFactor.P;
            if (correctedNeeds.K2O) correctedNeeds.K2O /= soilFactor.K;
            if (correctedNeeds.CaO) correctedNeeds.CaO /= (soilFactor.Ca || 1);
            if (correctedNeeds.MgO) correctedNeeds.MgO /= (soilFactor.Mg || 1);
            if (correctedNeeds.S) correctedNeeds.S /= (soilFactor.S || 1);
        }
        return correctedNeeds;
    }
    calculateFertilizerAmounts(nutrientNeeds, inputs) {
        const recommendations = [];

        // Efficiency Factors (Base)
        let efficiencyN = 0.85; // Default safe
        let efficiencyP = 0.80;
        let efficiencyK = 0.80;

        // Adjust based on Irrigation System
        switch (inputs.irrigation) {
            case 'drip': efficiencyN = 0.90; break;
            case 'sprinkler': efficiencyN = 0.75; break;
            case 'flood': efficiencyN = 0.55; break; // Low efficiency for flood
        }
        // P and K move less, so less affected by leaching, but fixation matters
        efficiencyP = efficiencyN * 0.9;
        efficiencyK = efficiencyN * 0.95;

        // Adjust for Soil (Sandy leads to leaching)
        if (inputs.soilType === 'sandy') {
            efficiencyN *= 0.8; // High leaching risk
            efficiencyK *= 0.85;
        }

        // Apply Logic
        for (const [nutrient, amount] of Object.entries(nutrientNeeds)) {
            if (amount <= 0.1) continue;

            let eff = efficiencyN;
            if (nutrient === 'P2O5') eff = efficiencyP;
            if (nutrient === 'K2O') eff = efficiencyK;

            // Pure Recommended Amount = Net Need / Efficiency
            const recommendedPure = amount / eff;

            recommendations.push({
                nutrient: nutrient,
                fertilizer: `عنصر ${nutrient === 'N' ? 'نيتروجين' : nutrient === 'P2O5' ? 'فوسفور' : 'بوتاسيوم'} صافي`,
                type: 'pure',
                requiredAmount: amount, // Net physiologic need
                actualAmount: recommendedPure, // Application recommendation
                unit: 'كجم',
                efficiency: eff,
                applicationMethod: 'يضاف حسب برنامج الري'
            });
        }

        return {
            recommendations: recommendations,
            costEstimation: null // Removed commercial cost estimation
        };
    }
    selectBestFertilizer(nutrient, amount, inputs) {
        const fertilizers = this.knowledgeBase.FERTILIZERS;
        let best = null, bestScore = -1;
        for (const [key, f] of Object.entries(fertilizers)) {
            if (f.composition[nutrient] > 0) {
                let score = f.composition[nutrient] * 0.4 + (10 - (f.price_per_kg || 0)) * 0.3;
                if (inputs.irrigation === 'drip') score += ((f.solubility || 0) / 1000) * 0.2;
                if (inputs.soilType === 'sandy' && f.pH_effect === 'حمضي') score += 1;
                if (score > bestScore) { bestScore = score; best = f; }
            }
        }
        return best;
    }
    getFertilizerEfficiency(f, inputs) { return (inputs.irrigation && f.efficiency && f.efficiency[inputs.irrigation]) || 0.6; }
    getApplicationMethod(f, inputs) { return f.solubility > 500 ? 'مع ماء الري (ال fertigation)' : 'نثر على سطح التربة'; }
    generateBasicSchedule(reqs, crop, inputs) {
        const schedule = [];
        const num = crop.growthStages ? Object.keys(crop.growthStages).length : 3;
        if (!reqs.recommendations) return [];
        reqs.recommendations.forEach(fert => {
            const amt = fert.actualAmount / num;
            for (let i = 0; i < num; i++) {
                schedule.push({
                    stage: this.getApplicationTiming(i, num, crop),
                    fertilizer: fert.fertilizer, amount: amt.toFixed(1), unit: 'kg', method: fert.applicationMethod
                });
            }
        });
        return schedule;
    }
    getApplicationTiming(i, total, crop) {
        const stages = ['قبل الزراعة أو بعدها مباشرة', 'بعد 3-4 أسابيع من الزراعة', 'قبل مرحلة الإزهار', 'خلال مرحلة العقد', 'قبل النضج'];
        return stages[i] || `التطبيق رقم ${i + 1}`;
    }
    calculateConfidenceLevel(inputs, mode) {
        let score = 50;
        if (inputs.crop) score += 10;
        if (inputs.area) score += 10;
        if (inputs.soilType) score += 10;
        return Math.min(95, score) / 100;
    }
    generateBasicWarnings(inputs, crop) {
        // Legacy warnings (replaced/augmented by SmartAnalyzer)
        const w = [];
        if (inputs.soilType === 'sandy' && inputs.irrigation === 'flood') {
            // Kept for backward compat but SmartAnalyzer covers this better
        }
        return w;
    }
    generateBasicTips(inputs, crop) { return ['قسّم السماد على عدة دفعات', 'راقب لون الأوراق']; }
}

// ============================================
// UI Bridge Logic
// ============================================

let currentMode = 'basic';
const calculator = new FertilizerCalculator();

document.addEventListener('DOMContentLoaded', () => {
    initializeCropSelect();

    // Listen to BOTH crop selects
    const cropSelect = document.getElementById('crop-type');
    const cropSelectInt = document.getElementById('crop-type-intermediate');

    if (cropSelect) cropSelect.addEventListener('change', function () { handleDynamicFields(this.value, 'basic'); });
    if (cropSelectInt) cropSelectInt.addEventListener('change', function () { handleDynamicFields(this.value, 'intermediate'); });

    // Globals
    window.calculateFertilizer = calculateFertilizer;
    window.resetForm = resetForm;
    window.setMode = setMode;
    window.printResults = printResults;
    window.resetAll = resetAll;
    window.toggleSoilTest = toggleSoilTest;
    window.toggleEmergencyPlan = toggleEmergencyPlan;
    window.setEmergencyTier = setEmergencyTier;

    // Mode Switching Listeners
    ['basic', 'intermediate', 'advanced'].forEach(m => {
        const btn = document.getElementById(`${m}-mode`);
        if (btn) btn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent any default button behavior
            setMode(m);
        });
    });

    // Auto-Save Init

    // Auto-Save Init
    loadFormData();
    // Auto-Save Trigger (Debounce slightly or just save on change)
    document.body.addEventListener('change', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') saveFormData();
    });
    document.body.addEventListener('input', (e) => {
        if (e.target.tagName === 'INPUT') saveFormData();
    });
});

// ============================================
// Auto-Save Logic (LocalStorage)
// ============================================
function saveFormData() {
    const data = {};
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(el => {
        if (el.id) {
            if (el.type === 'checkbox' || el.type === 'radio') data[el.id] = el.checked;
            else data[el.id] = el.value;
        }
    });
    // Save current mode as well
    data['__currentMode'] = currentMode;
    localStorage.setItem('mawasem_fertilizer_data', JSON.stringify(data));
}

function loadFormData() {
    const saved = localStorage.getItem('mawasem_fertilizer_data');
    if (!saved) return;
    try {
        const data = JSON.parse(saved);
        if (data['__currentMode']) setMode(data['__currentMode']);

        // Restore values
        for (const [id, val] of Object.entries(data)) {
            if (id === '__currentMode') continue;
            const el = document.getElementById(id);
            if (el) {
                if (el.type === 'checkbox' || el.type === 'radio') el.checked = val;
                else {
                    el.value = val;
                    // Trigger change to update dynamic fields if this is a crop selector
                    if (id.includes('crop') && el.tagName === 'SELECT') {
                        el.dispatchEvent(new Event('change'));
                    }
                }
            }
        }
        // Re-apply specific values after dynamic fields might be recreated
        // A simple timeout helps ensure dynamic DOM is ready if it wasn't synchronous
        setTimeout(() => {
            for (const [id, val] of Object.entries(data)) {
                const el = document.getElementById(id);
                if (el && el.closest && el.closest('[id^="dynamic"]')) {
                    // It's inside a dynamic container
                    if (el.type !== 'checkbox' && el.type !== 'radio') el.value = val;
                }
            }
        }, 100);

    } catch (e) { console.error("Auto-load failed", e); }
}

function setEmergencyTier(tier) {
    document.querySelectorAll('.emergency-tier-btn').forEach(btn => btn.classList.remove('active'));
    const btn = document.getElementById(`btn-tier-${tier}`);
    if (btn) btn.classList.add('active');

    document.querySelectorAll('.emergency-tier-content').forEach(el => el.style.display = 'none');
    const content = document.getElementById(`tier-${tier}-content`);
    if (content) content.style.display = 'block';

    // Show correct adopt button
    const modBtn = document.getElementById('adopt-moderate-btn');
    const extBtn = document.getElementById('adopt-extreme-btn');
    if (modBtn && extBtn) {
        if (tier === 'moderate') {
            modBtn.style.display = 'block';
            extBtn.style.display = 'none';
        } else {
            modBtn.style.display = 'none';
            extBtn.style.display = 'block';
        }
    }
}

function handleDynamicFields(cropKey, mode = 'basic') {
    const cropData = FERTILIZER_KNOWLEDGE_BASE.CROPS[cropKey];
    if (!cropData) return;

    // Determine target container based on mode
    // Determine target container based on mode
    let targetCropSelectId = 'crop-type';
    if (mode === 'intermediate') targetCropSelectId = 'crop-type-intermediate';
    else if (mode === 'advanced') targetCropSelectId = 'crop-variety';

    const cropGroup = document.getElementById(targetCropSelectId).closest('.input-group');

    // Create/Locate dynamic container unique to this mode
    let containerId = `dynamic-fields-container-${mode}`;

    // --- 1. Populate Growth Stage Dropdown (New Feature) ---
    const stageSelectId = mode === 'intermediate' ? 'growth-stage-intermediate' : 'growth-stage-basic';
    const stageContainerId = mode === 'intermediate' ? 'growth-stage-container-intermediate' : 'growth-stage-container-basic';
    const stageSelect = document.getElementById(stageSelectId);
    const stageContainer = document.getElementById(stageContainerId);

    if (stageSelect && stageContainer && cropData.growthStages) {
        stageSelect.innerHTML = '<option value="">اختر مرحلة النمو الحالية</option>';
        for (const [key, details] of Object.entries(cropData.growthStages)) {
            // Check if user friendly name exists, else use key
            // Golden Model structure usually sends keys like 'vegetative', 'flowering'
            // We can map them or if they have a 'name' property inside (some do)
            let displayName = key;
            const arabicNames = {
                'establishment': 'التأسيس / البادرة',
                'vegetative': 'النمو الخضري',
                'flowering': 'الإزهار / العقد',
                'fruiting': 'نمو الثمار',
                'harvest': 'النضج / الحصاد',
                'veraison': 'التلوين (Veraison)',
                'ripening': 'النضج',
                'post_harvest': 'ما بعد الحصاد',
                'dormancy': 'السكون',
                'dormancy_induction': 'السكون / التحريض الزهري',
                'pollination': 'التلقيح',
                'kimri': 'الكمري (Kimri)',
                'khalal': 'الخلال (Khalal)',
                'rutab': 'الرطب (Rutab)',
                'tamr': 'التمر (Tamr)',
                'rutab_tamr': 'الرطب والتمر',
                'flowering_fruit_set': 'الإزهار والعقد',
                'fruit_development': 'تكون الثمار / التحجيم',
                'maturation': 'النضج',
                'tillering': 'الإشطاء',
                'elongation': 'الاستطالة / السنابل',
                'grain_filling': 'امتلاء الحبوب',
                'heading_flowering': 'الإسبال والإزهار'
            };
            if (arabicNames[key]) displayName = arabicNames[key];

            stageSelect.innerHTML += `<option value="${key}">${displayName}</option>`;
        }
        stageContainer.style.display = 'block';
    } else if (stageContainer) {
        stageContainer.style.display = 'none'; // Hide if no stages defined
    }

    // --- 2. Update Crop Profile Card (New Feature) ---
    const profileId = mode === 'intermediate' ? 'crop-profile-intermediate' : 'crop-profile-basic';
    const profileCard = document.getElementById(profileId);

    if (profileCard) {
        let profileHtml = `<strong><i class="fas fa-info-circle"></i> هوية المحصول: ${cropData.name}</strong><br>`;
        let hasInfo = false;

        // Climate
        if (cropData.climate_requirements) {
            const temp = cropData.climate_requirements.temperature;
            if (temp) {
                let tempDisplay = '';
                if (typeof temp === 'object' && temp.optimal) {
                    // Handle Golden Model structure: { optimal: { min: 24, max: 30, unit: "C" }, ... }
                    // or legacy { min: 20, max: 30 }
                    if (temp.optimal.min !== undefined) {
                        tempDisplay = `${temp.optimal.min}-${temp.optimal.max} °C`;
                    } else {
                        tempDisplay = `${temp.min}-${temp.max} °C`; // Legacy fallback
                    }
                } else if (typeof temp === 'string') {
                    tempDisplay = temp;
                } else if (temp.range) {
                    tempDisplay = temp.range;
                }

                if (tempDisplay) {
                    profileHtml += `<span style="margin-left:10px;"><i class="fas fa-thermometer-half"></i> الحرارة: ${tempDisplay}</span>`;
                    hasInfo = true;
                }
            }
        }

        // Soil / Salinity
        if (cropData.soil_requirements) {
            const ph = cropData.soil_requirements.ph;
            const salinity = cropData.soil_requirements.salinity;

            if (ph) {
                profileHtml += `<span style="margin-left:10px;"><i class="fas fa-vial"></i> pH: ${ph.min}-${ph.max}</span>`;
                hasInfo = true;
            }
            if (salinity) {
                // Visualize Salinity Tolerance
                let color = 'green';
                if (salinity.tolerance === 'low' || salinity.tolerance === 'very sensitive') color = 'red';
                if (salinity.tolerance === 'moderate') color = 'orange';

                profileHtml += `<br><span style="color:${color}"><i class="fas fa-water"></i> تحمل الملوحة: ${salinity.tolerance === 'high' ? 'عالي ✅' : salinity.tolerance === 'low' ? 'منخفض ⚠️' : 'متوسط'} (Max: ${salinity.max_ec} dS/m)</span>`;
                hasInfo = true;
                // --- RETRY LOGIC FOR DB ---
                const initDB = () => {
                    if (typeof window.agricultureDatabase !== 'undefined') {
                        console.log("DB Loaded.");
                        // Try to load saved form data if available
                        if (typeof loadFormData === 'function') {
                            loadFormData();
                        }
                    } else {
                        console.warn("DB not ready, retrying...");
                        setTimeout(initDB, 500);
                    }
                };
                initDB();

                // --- AUTO-SAVE FORM DATA ---
                const formInputs = document.querySelectorAll('select, input');
                formInputs.forEach(input => {
                    input.addEventListener('change', () => {
                        if (typeof saveFormData === 'function') {
                            saveFormData();
                        }
                    });
                });
            }
        }

        if (hasInfo) {
            profileCard.innerHTML = profileHtml;
            profileCard.style.display = 'block';
        } else {
            profileCard.style.display = 'none';
        }
    }

    let dynamicContainer = document.getElementById(containerId);

    if (!dynamicContainer) {
        dynamicContainer = document.createElement('div');
        dynamicContainer.id = containerId;
        dynamicContainer.style.marginTop = '15px';
        cropGroup.parentNode.insertBefore(dynamicContainer, cropGroup.nextSibling);
    }

    let html = '';
    const suffix = mode === 'basic' ? '' : ('-' + mode);
    const isGreenhouse = ['tomato', 'cucumber', 'pepper', 'eggplant', 'zucchini', 'strawberry', 'okra'].includes(cropKey);

    // --- Environment / Cultivation Type ---
    if (isGreenhouse) {
        html += `
            <div class="input-group" style="background-color:#e8f5e9; padding:15px; border-radius:8px; border:1px solid #c8e6c9; margin-bottom:10px;">
                <label style="color:#2e7d32; font-weight:bold;"><i class="fas fa-warehouse"></i> بيئة الزراعة</label>
                <select id="cultivation-type${suffix}" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:4px;">
                    <option value="open">حقل مكشوف (Open Field)</option>
                    <option value="greenhouse" selected>بيوت محمية (Greenhouse)</option>
                </select>
            </div>`;
    }

    // --- Field Crops / Vegetables Specifics ---
    if (cropData.type === 'field') {
        html += `
            <div class="input-group" style="background-color:#f1f8e9; padding:15px; border-radius:8px; border:1px solid #dcedc8; margin-top:10px;">
                <label style="color:#558b2f; font-weight:bold;"><i class="fas fa-seedling"></i> سياق المحصول</label>
                
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-top:10px;">
                    <!-- Plant Density -->
                    <div>
                        <label style="font-size:0.9em; display:block;">الكثافة النباتية (عدد الشتلات)</label>
                        <input type="number" id="plant-density${suffix}" placeholder="لكل وحدة مساحة" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:4px;">
                    </div>
                
                    <!-- Planting Date -->
                    <div>
                        <label style="font-size:0.9em; display:block;">تاريخ الزراعة</label>
                        <input type="date" id="planting-date${suffix}" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:4px;" onchange="calculateCropAge(this.value, 'crop-age-display${suffix}')">
                    </div>
                </div>

                <!-- Calculated Age Display -->
                <div id="crop-age-display${suffix}" style="margin-top:5px; font-size:0.85em; color:#666; font-style:italic;"></div>

                <!-- Growth Stage -->
                <div style="margin-top:10px;">
                    <label style="font-size:0.9em; display:block;">مرحلة النمو الحالية</label>
                    <select id="growth-stage${suffix}" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:4px;">
                        <option value="seedling">🌱 بذر / شتلة (T0-T1)</option>
                        <option value="vegetative">🌿 نمو خضري (Vegetative)</option>
                        <option value="flowering">🌼 إزهار / عقد (Flowering)</option>
                        <option value="fruiting">🍅 إثمار / تحجيم (Fruiting)</option>
                        <option value="harvest">🌾 حصاد (Harvest)</option>
                    </select>
                </div>
            </div>`;
    }

    // --- Tree Crops Specifics ---
    if (cropData.type === 'tree') {
        html += `
            <div class="input-group" style="background-color:#fff8e1; padding:15px; border-radius:8px; border:1px solid #ffe082; margin-top:10px;">
                <label style="color:#f57f17; font-weight:bold;"><i class="fas fa-tree"></i> بيانات الأشجار</label>`;

        if (mode !== 'advanced') {
            html += `
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-top:10px;">
                    <!-- Tree Count -->
                    <div>
                        <label style="font-size:0.9em; display:block;">عدد الأشجار</label>
                        <input type="number" id="tree-count${suffix}" placeholder="مثلاً 50" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:4px;">
                    </div>

                    <!-- Tree Age -->
                    <div>
                        <label style="font-size:0.9em; display:block;">عمر الشجرة</label>
                        <select id="tree-age${suffix}" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:4px;">
                            <option value="1-2">شتلة (1-2 سنة)</option>
                            <option value="3-5">نامية (3-5 سنوات)</option>
                            <option value="5+">مثمرة (5+ سنوات)</option>
                        </select>
                    </div>
                </div>`;
        }

        html += `
                <!-- Phenological Stage -->
                <div style="margin-top:10px;">
                    <label style="font-size:0.9em; display:block;">المرحلة الموسمية</label>
                    <select id="phenology-stage${suffix}" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:4px;">
                        <option value="dormancy">💤 سكون شتوي (Dormancy)</option>
                        <option value="flowering">🌸 تزهير (Flowering)</option>
                        <option value="fruit_set">🍒 عقد الثمار (Fruit Set)</option>
                        <option value="fruit_growth">🍏 تحجيم الثمار (Fruit Growth)</option>
                        <option value="harvest">🧺 حصاد (Harvest)</option>
                        <option value="post_harvest">🍂 خدمة بعد الحصاد</option>
                    </select>
                </div>

                <div class="input-hint">سيتم تخصيص البرنامج حسب العمر والمرحلة الموسمية.</div>
            </div>`;
    }

    if (html) { dynamicContainer.innerHTML = html; dynamicContainer.style.display = 'block'; }
    else { dynamicContainer.innerHTML = ''; dynamicContainer.style.display = 'none'; }
}

// Helper to calculate age from date
function calculateCropAge(dateString, elementId) {
    if (!dateString) return;
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = `عمر المحصول: ${diffDays} يوم`;
    }
}

function initializeCropSelect() {
    const cropSelect = document.getElementById('crop-type');
    const cropSelectInt = document.getElementById('crop-type-intermediate');
    const cropSelectAdv = document.getElementById('crop-variety'); // Advanced Mode

    const populate = (select) => {
        if (!select) return;
        select.innerHTML = '<option value="" disabled selected>اختر المحصول</option>';
        if (typeof FERTILIZER_KNOWLEDGE_BASE !== 'undefined') {
            Object.entries(FERTILIZER_KNOWLEDGE_BASE.CROPS).forEach(([key, data]) => {
                const icon = data.type === 'tree' ? '🌳' : '🌱';
                const option = document.createElement('option');
                option.value = key; option.textContent = `${icon} ${data.name}`; select.appendChild(option);
            });
        }
    };
    populate(cropSelect);
    populate(cropSelectInt);
    populate(cropSelectAdv);
}

function setMode(mode) {
    currentMode = mode;
    // Update Buttons
    ['basic', 'intermediate', 'advanced'].forEach(m => {
        const btn = document.getElementById(`${m}-mode`);
        if (btn) {
            if (m === mode) btn.classList.add('active');
            else btn.classList.remove('active');
        }
    });

    // Update Input Containers
    ['basic', 'intermediate', 'advanced'].forEach(m => {
        const container = document.getElementById(`${m}-inputs`);
        if (container) {
            if (m === mode) {
                container.classList.add('active');
                container.style.display = 'block';
            } else {
                container.classList.remove('active');
                container.style.display = 'none';
            }
        }
    });

    // Save state
    saveFormData();
}

function resetForm() {
    if (confirm('هل أنت متأكد من مسح جميع البيانات؟')) {
        localStorage.removeItem('mawasem_fertilizer_data');
        window.location.reload();
    }
}
function resetAll() { resetForm(); }
function toggleSoilTest() {
    const val = document.getElementById('has-soil-test').value;
    const fields = document.getElementById('soil-test-fields');
    if (fields) fields.style.display = val === 'yes' ? 'block' : 'none';
}
function printResults() { window.print(); }
function toggleEmergencyPlan() {
    const plan = document.getElementById('emergency-plan');
    if (plan) plan.style.display = plan.style.display === 'none' ? 'block' : 'none';
}

function collectInputs(mode) {
    const val = (id) => { const el = document.getElementById(id); return el ? el.value : null; };
    let inputs = { mode: mode };

    // Determine suffix based on mode for dynamic fields
    const suffix = mode === 'intermediate' ? '-intermediate' : '';

    if (mode === 'basic' || mode === 'intermediate') {
        const isInter = mode === 'intermediate';
        inputs.crop = val(isInter ? 'crop-type-intermediate' : 'crop-type');
        inputs.area = parseFloat(val(isInter ? 'area-intermediate' : 'area')) || 0;
        inputs.areaUnit = val(isInter ? 'area-unit-intermediate' : 'area-unit');

        inputs.soilType = val(isInter ? 'soil-type-intermediate' : 'soil-type');
        inputs.irrigation = val(isInter ? 'irrigation-type-intermediate' : 'irrigation-type');
        inputs.climate = val(isInter ? 'climate-zone-intermediate' : 'climate-zone');

        // Dynamic Fields with Suffix
        inputs.cultivationType = val(`cultivation-type${suffix}`);
        inputs.treeCount = parseFloat(val(`tree-count${suffix}`)) || 0;
        inputs.treeAge = val(`tree-age${suffix}`);

        // Missing fields for Field Crops / Phenology
        inputs.plantDensity = parseFloat(val(`plant-density${suffix}`)) || 0;
        inputs.plantingDate = val(`planting-date${suffix}`);
        inputs.growthStage = val(`growth-stage${suffix}`);
        inputs.phenologyStage = val(`phenology-stage${suffix}`);
    }
    // Intermediate extras
    if (mode === 'intermediate') {
        inputs.plantingDate = val('planting-date');
        inputs.previousCrop = val('previous-crop');
        inputs.previousYield = parseFloat(val('previous-yield')) || 0;
        inputs.organicMatter = parseFloat(val('organic-matter')) || 0;
        inputs.soilN = parseFloat(val('soil-n'));
        inputs.soilP = parseFloat(val('soil-p'));
        inputs.soilK = parseFloat(val('soil-k'));
        inputs.budget = parseFloat(val('budget'));
    }
    else if (mode === 'advanced') {
        inputs.crop = val('crop-variety');
        inputs.area = parseFloat(val('area-advanced')) || 0;
        inputs.areaUnit = val('area-unit-advanced') || 'hectare';
        inputs.treeCount = parseFloat(val('tree-count-advanced')) || 0;

        // Dynamic Fields (Advanced)
        inputs.cultivationType = val('cultivation-type-advanced');
        inputs.plantDensity = parseFloat(val('plant-density-advanced')) || 0;
        inputs.plantingDate = val('planting-date-advanced');
        inputs.growthStage = val('growth-stage-advanced');
        inputs.phenologyStage = val('phenology-stage-advanced');

        // Soil Analysis
        inputs.soilN = parseFloat(val('advanced-n'));
        inputs.soilP = parseFloat(val('advanced-p'));
        inputs.soilK = parseFloat(val('advanced-k'));
        inputs.ph = parseFloat(val('soil-ph'));
        inputs.ec = parseFloat(val('soil-ec'));
        inputs.organicMatter = parseFloat(val('soil-om')); // Corrected ID from advanced-organic

        // Micros
        inputs.Fe = parseFloat(val('soil-fe'));
        inputs.Zn = parseFloat(val('soil-zn'));
        inputs.Mn = parseFloat(val('soil-mn'));
        inputs.Cu = parseFloat(val('soil-cu'));
        inputs.B = parseFloat(val('soil-b'));

        // Properties
        inputs.cec = parseFloat(val('cec'));
        inputs.clayPercent = parseFloat(val('clay-percent'));
        inputs.sandPercent = parseFloat(val('sand-percent'));

        // Context / Environmental
        inputs.irrigation = val('irrigation-type-advanced');
        inputs.climate = val('climate-zone-advanced');
        inputs.season = val('planting-season');
        inputs.orientation = val('field-orientation');
        inputs.treeAge = val('tree-age-advanced');
        // Yield Goals
        inputs.previousYieldStatus = val('production-history');
        inputs.targetYield = val('target-yield');

        // Fallbacks
        inputs.soilType = inputs.clayPercent > 35 ? 'clay' : (inputs.clayPercent < 15 ? 'sandy' : 'loam');
    }
    return inputs;
}

function calculateFertilizer(inputMode) {
    const mode = inputMode || currentMode;
    try {
        const inputs = collectInputs(mode);
        const results = calculator.calculate(inputs);
        displayResults(results, inputs);
        window.lastCalculationResult = results; // Store for Market Bridge
    } catch (e) { alert("تنبيه: " + e.message); console.error(e); }
}

// --- 3. DISPLAY RESULTS FUNCTION ---
function displayResults(results, inputs) {
    const rc = document.getElementById('results-container');
    document.querySelectorAll('.input-container').forEach(el => { el.style.display = 'none'; el.classList.remove('active'); });

    if (rc) { rc.style.display = 'block'; rc.scrollIntoView({ behavior: 'smooth' }); }

    // Confidence
    const cf = document.getElementById('confidence-fill');
    const cv = document.getElementById('confidence-value');
    if (cf) {
        const pct = Math.round(results.confidence * 100);
        cf.style.width = `${pct}%`;
        if (cv) cv.textContent = `ثقة ${pct}%`;
        if (pct > 80) cf.style.backgroundColor = '#4CAF50';
        else if (pct > 60) cf.style.backgroundColor = '#FF9800';
        else cf.style.backgroundColor = '#f44336';
    }

    // Summary
    const cs = document.getElementById('crop-summary');
    if (cs) {
        let text = `المحصول: ${results.crop} | المساحة: ${results.area.value} ${results.area.unit}`;

        if (results.treeDetails) {
            text += ` | عدد الأشجار: ${results.treeDetails.count} | العمر: ${results.treeDetails.age === '1-2' ? 'شتلة' : results.treeDetails.age === '3-5' ? 'نامية' : 'مثمرة'}`;
            if (results.treeDetails.phenology) text += ` | المرحلة: ${results.treeDetails.phenology}`;
        }
        else if (results.fieldDetails) {
            text += ` | الكثافة: ${results.fieldDetails.density || 'غير محدد'} | المرحلة: ${results.fieldDetails.stage || 'غير محدد'}`;
        }
        else if (results.cultivationType === 'greenhouse') text += ' (بيوت محمية)';
        else if (results.cultivationType === 'open') text += ' (مكشوف)';

        cs.textContent = text;
    }

    // Cost (Removed for Pure Nutrient Mode, or repurposed)
    const tf = document.getElementById('total-fertilizer');
    const tc = document.getElementById('total-cost');
    const de = document.getElementById('program-duration');

    // Display Total Pure Needs Summary (Application Needs)
    if (tf && results.fertilizerRecommendations) {
        let totalApp = 0;
        results.fertilizerRecommendations.forEach(r => totalApp += r.actualAmount);
        tf.textContent = `${Math.ceil(totalApp)} كجم (صافي تطبيقي)`;
    }
    if (tc) tc.textContent = 'غير متاح (تحليل نقي)';

    // --- Dynamic Stage Name Logic ---
    const STAGE_TRANSLATIONS = {
        // General / Trees
        'dormancy': 'مرحلة السكون (التحضير)',
        'vegetative': 'مرحلة النمو الخضري',
        'flowering': 'مرحلة الإزهار',
        'fruiting': 'نمو الثمار', // Fixed Translation
        'fruit_development': 'مرحلة عقد وتكوين الثمار',
        'harvest': 'مرحلة الحصاد وما بعده',

        // Cereals (Wheat, Barley)
        'tillering': 'مرحلة الإشطاء (التفريع)',
        'elongation': 'مرحلة الاستطالة',
        'heading': 'مرحلة طرد السنابل',
        'ripening': 'مرحلة النضج والامتلاء',

        // Date Palm Specific
        'rutab_tamr': 'مرحلة الرطب والتمر',
        'kimri': 'مرحلة الكمري',
        'khalal': 'مرحلة الخلال',
        'pollination': 'مرحلة التلقيح',

        // Tubers (Potato)
        'planting': 'مرحلة الزراعة والإنبات (Basal)',
        'tuber_initiation': 'مرحلة تكوين الدرنات',
        'tuber_bulking': 'مرحلة تحجيم الدرنات',
        'maturation': 'مرحلة النضج',

        // Vegetables (Generics)
        'seedling': 'مرحلة الشتلات'
    };

    let stageName = 'موسم كامل';
    let rawStageKey = null;

    if (results.treeDetails && results.treeDetails.phenology) {
        rawStageKey = results.treeDetails.phenology;
    } else if (results.fieldDetails && results.fieldDetails.stage) {
        rawStageKey = results.fieldDetails.stage;
    }

    if (rawStageKey && STAGE_TRANSLATIONS[rawStageKey]) {
        stageName = STAGE_TRANSLATIONS[rawStageKey];
    } else if (rawStageKey) {
        stageName = rawStageKey; // Fallback to key if translation missing
    }

    if (de) de.textContent = stageName;

    // Add Action Buttons (Adopt & Save)
    const summaryCard = document.getElementById('summary-card');
    if (summaryCard && results.fertilizerRecommendations) {
        // Clear old buttons wrapper if exists
        const oldWrapper = document.getElementById('action-buttons-wrapper');
        if (oldWrapper) oldWrapper.remove();

        // Remove individual old buttons if any
        const existingBtn = document.getElementById('adopt-main-plan-btn');
        if (existingBtn) existingBtn.remove();

        const wrapper = document.createElement('div');
        wrapper.id = 'action-buttons-wrapper';
        wrapper.style.cssText = 'display:flex; gap:10px; margin-top:10px; flex-wrap:wrap; justify-content:center;';

        // 1. Adopt Button
        const adoptBtn = document.createElement('button');
        adoptBtn.id = 'adopt-main-plan-btn';
        adoptBtn.className = 'btn btn-primary btn-small';
        adoptBtn.innerHTML = '<i class="fas fa-check-circle"></i> اعتماد للسوق';
        adoptBtn.onclick = function () {
            this.innerHTML = '<i class="fas fa-check-double"></i> تم الاعتماد';
            this.style.background = '#4CAF50';
            window.lastCalculationResult = results;
            if (window.bridgeToMarketPlan) window.bridgeToMarketPlan();
        };

        // 2. Save Wallet Button
        const saveBtn = document.createElement('button');
        saveBtn.id = 'save-wallet-plan-btn';
        saveBtn.className = 'btn btn-secondary btn-small';
        saveBtn.innerHTML = '<i class="fas fa-wallet"></i> حفظ في المحفظة';
        saveBtn.style.background = '#2e7d32'; // Wallet green
        saveBtn.style.color = 'white';
        saveBtn.onclick = function () {
            if (typeof saveCurrentPlanToStorage === 'function') {
                const success = saveCurrentPlanToStorage(results, inputs);
                if (success) {
                    this.innerHTML = '<i class="fas fa-check"></i> تم الحفظ';
                    this.disabled = true;
                    // Reset button after delay
                    setTimeout(() => {
                        this.innerHTML = '<i class="fas fa-wallet"></i> حفظ في المحفظة';
                        this.disabled = false;
                    }, 3000);
                } else {
                    // Alert handled by saveCurrentPlanToStorage
                    // Do NOT disable button, let user retry
                    this.classList.add('shake-anim'); // Optional visual cue
                    setTimeout(() => this.classList.remove('shake-anim'), 500);
                }
            } else {
                alert('عذراً، نظام الحفظ غير متوفر حالياً.');
            }
        };

        wrapper.appendChild(adoptBtn);
        wrapper.appendChild(saveBtn);
        summaryCard.appendChild(wrapper);
    }

    // Recommendations Cards
    const fc = document.getElementById('fertilizer-cards');
    if (fc) {
        fc.innerHTML = '';
        if (results.fertilizerRecommendations) {
            results.fertilizerRecommendations.forEach(rec => {
                const card = document.createElement('div');

                // Determine class based on nutrient
                let nutrientClass = 'nutrient-micro';
                let iconClass = 'fa-vial';
                let arName = rec.nutrient;

                if (rec.nutrient === 'N') { nutrientClass = 'nutrient-N'; iconClass = 'fa-leaf'; arName = 'النيتروجين (N)'; }
                else if (rec.nutrient === 'P2O5') { nutrientClass = 'nutrient-P2O5'; iconClass = 'fa-root-set'; arName = 'الفسفور (P)'; }
                else if (rec.nutrient === 'K2O') { nutrientClass = 'nutrient-K2O'; iconClass = 'fa-apple-alt'; arName = 'البوتاسيوم (K)'; }
                else if (rec.nutrient === 'CaO') { nutrientClass = 'nutrient-CaO'; iconClass = 'fa-bone'; arName = 'الكالسيوم (Ca)'; }
                else if (rec.nutrient === 'MgO') { nutrientClass = 'nutrient-MgO'; iconClass = 'fa-atom'; arName = 'الماغنسيوم (Mg)'; }
                else if (rec.nutrient === 'S') { nutrientClass = 'nutrient-S'; iconClass = 'fa-wind'; arName = 'الكبريت (S)'; }
                // Micro-Nutrients (New)
                else if (rec.nutrient === 'Fe') { nutrientClass = 'nutrient-Fe'; iconClass = 'fa-cubes'; arName = 'الحديد (Fe)'; }
                else if (rec.nutrient === 'Zn') { nutrientClass = 'nutrient-Zn'; iconClass = 'fa-shield-alt'; arName = 'الزنك (Zn)'; }
                else if (rec.nutrient === 'Mn') { nutrientClass = 'nutrient-Mn'; iconClass = 'fa-bacterium'; arName = 'المنجنيز (Mn)'; }
                else if (rec.nutrient === 'Cu') { nutrientClass = 'nutrient-Cu'; iconClass = 'fa-battery-full'; arName = 'النحاس (Cu)'; }
                else if (rec.nutrient === 'B') { nutrientClass = 'nutrient-B'; iconClass = 'fa-bullseye'; arName = 'البرون (B)'; }

                // Fallback for icons if specific ones aren't available in standard FA
                if (iconClass === 'fa-root-set') iconClass = 'fa-carrot'; // close approximation

                card.className = `result-card ${nutrientClass}`;

                // Contextual Info Logic
                let contextInfo = '';

                // Case 1: Trees (Show Grams per Tree)
                if (results.treeDetails && results.treeDetails.count > 0) {
                    const gPerTree = (rec.actualAmount * 1000) / results.treeDetails.count;
                    contextInfo = `
                        <div style="margin-top:5px; padding-top:5px; border-top:1px dashed #ccc;">
                            <strong>${Math.round(gPerTree)}</strong> جرام / شجرة
                        </div>`;
                }
                // Case 2: Field Crops (Show amount per Habla - Local Context)
                else {
                    // Assuming area unit is Dunum for calculation context, or just splitting total
                    // 1 Dunum approx 15 Habla (Local Dialect)
                    // If area is 1, total is per dunum.
                    // We can show "Per Habla" as a helpful tip.
                    const amountPerHabla = rec.actualAmount / (inputs.area * 15); // Rough approx if area is dunums
                    // Actually, let's keep it safer: if area is 1 dunum, it's /15. If area is X dunums, total / (X*15) is per habla.
                    // Let's just say "Msg: For 1 Dunum ~ 15 Habla"

                    // Better: Display "Kg per Dunum" explicitly if not already obvious
                    // And "approx X kg per Habla"

                    // We will assume the input 'area' is properly accounted for in 'actualAmount' (which is Total Amount).
                    // So per Habla = Total Amount / (Area * 15).

                    const perHabla = rec.actualAmount / (inputs.area * 15);
                    const perHablaText = perHabla < 1
                        ? `${Math.round(perHabla * 1000)} جرام / حبلة`
                        : `${parseFloat(perHabla.toFixed(2))} كجم / حبلة`;

                    contextInfo = `
                        <div style="margin-top:5px; padding-top:5px; border-top:1px dashed #ccc;">
                            <small>للدونم (15 حبلة):</small><br>
                            <strong>${perHablaText}</strong>
                        </div>`;
                }

                card.innerHTML = `
                    <div class="card-header">
                        <div class="card-icon"><i class="fas ${iconClass}"></i></div>
                        <div class="card-title">
                            <h3>${rec.nutrient}</h3>
                            <span>${arName}</span>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="card-value">${Math.ceil(rec.actualAmount * 10) / 10}</div>
                        <div class="card-unit">${rec.unit}</div>
                        ${contextInfo}
                    </div>
                    <div class="card-footer">
                        <i class="fas fa-info-circle"></i> ${rec.note || 'احتياج صافي للموسم'}
                    </div>
                `;
                fc.appendChild(card);
            });
        }
    }

    // Schedule Table
    const sb = document.getElementById('schedule-body');
    if (sb) {
        sb.innerHTML = '';
        if (results.applicationSchedule) {
            results.applicationSchedule.forEach(stage => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${stage.stage || '-'}</td>
                    <td>${stage.fertilizer || 'مركب NPK'}</td>
                    <td>${stage.amount} كجم</td>
                    <td>${stage.method || 'رشي / أرضي'}</td>
                    <td>${stage.timing || '-'}</td>
                `;
                sb.appendChild(tr);
            });
        }
    }

    // Special Tips / Correction Factors / Risk Analysis Display
    const st = document.getElementById('special-tips');
    if (st) {
        st.innerHTML = '';
        let risks = [];

        // 1. Analyze pH Risks
        if (inputs.ph && inputs.ph > 7.5) {
            risks.push({
                type: 'warning',
                icon: 'fa-vial',
                title: 'قلوية التربة مرتفعة (pH > 7.5)',
                text: 'التربة قلوية، مما يقلل امتصاص العناصر الصغرى والفسفور. <strong>ننصح باستخدام أسمدة حامضية (مثل سلفات الأمونيوم) وإضافة الكبريت الزراعي.</strong>'
            });
        }

        // 2. Analyze Salinity Risks (EC)
        // Check both Soil EC and Water EC if available
        const ecVal = inputs.ec || (inputs.waterEc ? inputs.waterEc * 1.5 : 0); // Rough estimation if only water EC known
        if (ecVal > 4) {
            risks.push({
                type: 'danger',
                icon: 'fa-water',
                title: 'مخاطر الملوحة (EC > 4)',
                text: 'التربة/المياه عالية الملوحة. <strong>يجب زيادة معدلات الري بنسبة 15% لغسيل الأملاح (Leaching Requirement) وتجنب الأسمدة التي ترفع الملوحة (مثل كلوريد البوتاسيوم).</strong>'
            });
        }

        // 3. Analyze Soil Texture Risks
        if (inputs.soilType === 'sandy') {
            risks.push({
                type: 'info',
                icon: 'fa-wind',
                title: 'تربة رملية (ضعيفة الاحتفاظ)',
                text: 'التربة الرملية لا تحتفظ بالماء والسماد طويلاً. <strong>ينصح بتقسيم الجرعات السمادية إلى دفعات صغيرة ومتكررة (التسميد مع كل رية) لتجنب الغسيل.</strong>'
            });
        } else if (inputs.soilType === 'clay') {
            risks.push({
                type: 'info',
                icon: 'fa-cube',
                title: 'تربة طينية (صرف بطيء)',
                text: 'التربة الطينية تحتفظ بالماء وقد تسبب تعفن الجذور. <strong>تجنب الإسراف في الري وتأكد من جودة الصرف.</strong>'
            });
        }

        // 4. Add existing technical corrections
        if (results.correctionsApplied && results.correctionsApplied.length > 0) {
            results.correctionsApplied.forEach(c => {
                risks.push({
                    type: 'technical',
                    icon: 'fa-sliders-h',
                    title: `تعديل فني: ${c.factor}`,
                    text: `${c.description} (تم تعديل الكميات بنسبة ${c.multiplier}x)`
                });
            });
        }

        if (risks.length > 0) {
            risks.forEach(risk => {
                const div = document.createElement('div');
                div.className = `risk-item ${risk.type}`;
                div.style.cssText = `
                    padding: 10px; 
                    margin-bottom: 8px; 
                    border-radius: 6px; 
                    border-right: 4px solid #ccc; 
                    background: #f9f9f9;
                    display: flex;
                    gap: 10px;
                    align-items: flex-start;
                `;

                // Colors
                if (risk.type === 'danger') div.style.borderRightColor = '#f44336';
                if (risk.type === 'warning') div.style.borderRightColor = '#ff9800';
                if (risk.type === 'info') div.style.borderRightColor = '#2196f3';
                if (risk.type === 'technical') div.style.borderRightColor = '#607d8b';

                div.innerHTML = `
                    <div style="color: #555; font-size: 1.2em; padding-top:2px;">
                        <i class="fas ${risk.icon}"></i>
                    </div>
                    <div>
                        <strong style="display:block; margin-bottom:4px; font-size:0.95em;">${risk.title}</strong>
                        <span style="font-size:0.9em; color:#666;">${risk.text}</span>
                    </div>
                `;
                st.appendChild(div);
            });
            // Ensure container is visible
            const parent = document.getElementById('special-recommendations');
            if (parent) parent.style.display = 'block';
        } else {
            st.innerHTML = '<div style="padding:10px; text-align:center; color:#888;">لا توجد مخاطر أو ملاحظات خاصة لهذه الظروف.</div>';
            // Hide parent if desired, or keep showing "No risks"
            const parent = document.getElementById('special-recommendations');
            if (parent) parent.style.display = 'block';
        }
    }

    // Emergency Plan Logic (Visual Display)
    const ep = document.getElementById('emergency-plan'); // Correctly targeting the emergency plan container

    // Check if result has emergency plan
    if (results.emergencyPlan) {
        const modPlan = results.emergencyPlan.moderate;
        const extPlan = results.emergencyPlan.extreme;

        // Populate cards inside 'emergency-cards' div instead of overwriting the whole parent
        const epCards = document.getElementById('emergency-cards');
        if (epCards) {
            epCards.innerHTML = `
            <div style="background:#fff3e0; border:1px solid #ffb74d; padding:15px; border-radius:8px;">
                <h3 style="color:#e65100; display:flex; align-items:center; gap:10px;">
                    <i class="fas fa-exclamation-circle"></i> خطة الطوارئ والتقشف
                </h3>
                <div class="tier-toggles" style="display:flex; gap:10px; margin:15px 0;">
                    <button id="btn-tier-moderate" class="btn emergency-tier-btn active" onclick="setEmergencyTier('moderate')" style="flex:1; padding:10px; border:1px solid #ffb74d; background:#fff; color:#e65100; border-radius:4px; font-weight:bold; cursor:pointer;">
                         توفير 40% (متوازن)
                    </button>
                    <button id="btn-tier-extreme" class="btn emergency-tier-btn" onclick="setEmergencyTier('extreme')" style="flex:1; padding:10px; border:1px solid #d32f2f; background:#fff; color:#d32f2f; border-radius:4px; font-weight:bold; cursor:pointer;">
                         توفير 60% (أقصى توفير) 🔥
                    </button>
                </div>
                
                <div id="tier-adopt-buttons" style="margin-bottom:15px; text-align:center;">
                    <button id="adopt-moderate-btn" class="btn btn-small" style="display:block; margin:0 auto; background:#e65100; color:white;" 
                        onclick="adoptEmergencyPlan('moderate')">
                        <i class="fas fa-check-circle"></i> اعتماد خطة التوفير المتوازن
                    </button>
                    <button id="adopt-extreme-btn" class="btn btn-small" style="display:none; margin:0 auto; background:#d32f2f; color:white;" 
                        onclick="adoptEmergencyPlan('extreme')">
                        <i class="fas fa-check-circle"></i> اعتماد خطة التوفير القصوى
                    </button>
                </div>

                <div id="tier-moderate-content" class="emergency-tier-content" style="display:block;">
                    <div class="result-cards" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:15px;">
                        ${modPlan.recommendations.map(rec => `
                            <div class="result-card" style="border-right:4px solid #ff9800; background:white; padding:10px; border-radius:4px; box-shadow:0 2px 4px rgba(0,0,0,0.05);">
                                <h5 style="margin:0;">${rec.nutrient}</h5>
                                <p style="margin:5px 0;">الكمية: <strong>${Math.ceil(rec.actualAmount * 100) / 100} ${rec.unit}</strong></p>
                                <p style="margin:5px 0;">التكلفة: ${Math.round(rec.cost)} ريال</p>
                                <span style="font-size:0.8em; color:#e65100;">${rec.note}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div id="tier-extreme-content" class="emergency-tier-content" style="display:none;">
                    <div class="result-cards" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:15px;">
                        ${extPlan.recommendations.map(rec => `
                            <div class="result-card" style="border-right:4px solid #d32f2f; background:white; padding:10px; border-radius:4px; box-shadow:0 2px 4px rgba(0,0,0,0.05);">
                                <h5 style="margin:0;">${rec.nutrient}</h5>
                                <p style="margin:5px 0;">الكمية: <strong>${Math.ceil(rec.actualAmount * 100) / 100} ${rec.unit}</strong></p>
                                <p style="margin:5px 0;">التكلفة: ${Math.round(rec.cost)} ريال</p>
                                <span style="font-size:0.8em; color:#d32f2f; font-weight:bold;">${rec.note}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
            if (ep) ep.style.display = 'block';
        } else {
            if (ep) ep.style.display = 'none';
        }

        // --- AUTO-SAVE to Wallet ---
        // Safely check if inputs exists appropriately 
        // if (typeof saveCurrentPlanToStorage === 'function' && inputs) {
        //     saveCurrentPlanToStorage(results, inputs);
        // }
    }


}



// --- Bridge Function to Market Plan ---
// This function bridges the calculated scientific results to the Market Plan UI
window.bridgeToMarketPlan = function () {
    const results = window.lastCalculationResult;
    if (!results || !results.fertilizerRecommendations) { // Changed from results.recommendations to results.fertilizerRecommendations
        alert("يرجى إجراء الحساب أولاً للحصول على التوصيات.");
        return;
    }

    // Aggregate totals from recommendations
    let totals = { N: 0, P: 0, K: 0, Ca: 0, Mg: 0, S: 0, Fe: 0, Zn: 0 };
    results.fertilizerRecommendations.forEach(rec => {
        if (rec.nutrient === 'N') totals.N += rec.actualAmount;
        if (rec.nutrient === 'P2O5') totals.P += rec.actualAmount;
        if (rec.nutrient === 'K2O') totals.K += rec.actualAmount;
        if (rec.nutrient === 'CaO') totals.Ca += rec.actualAmount;
        if (rec.nutrient === 'MgO') totals.Mg += rec.actualAmount;
        if (rec.nutrient === 'S') totals.S += rec.actualAmount;
        if (rec.nutrient === 'Fe') totals.Fe += rec.actualAmount;
        if (rec.nutrient === 'Zn') totals.Zn += rec.actualAmount;
    });

    const safe = (val) => val ? Math.ceil(val) : 0;
    const safeFloat = (val) => val ? parseFloat(val.toFixed(2)) : 0;

    // Populate Farm Needs in Market Plan
    if (document.getElementById('bridge-need-n')) document.getElementById('bridge-need-n').value = safe(totals.N);
    if (document.getElementById('bridge-need-p')) document.getElementById('bridge-need-p').value = safe(totals.P);
    if (document.getElementById('bridge-need-k')) document.getElementById('bridge-need-k').value = safe(totals.K);

    // New Nutrients (Phase 7/8 Support)
    if (document.getElementById('bridge-need-ca')) document.getElementById('bridge-need-ca').value = safe(totals.Ca);
    if (document.getElementById('bridge-need-mg')) document.getElementById('bridge-need-mg').value = safe(totals.Mg);
    if (document.getElementById('bridge-need-s')) document.getElementById('bridge-need-s').value = safe(totals.S);
    if (document.getElementById('bridge-need-fe')) document.getElementById('bridge-need-fe').value = safeFloat(totals.Fe);
    if (document.getElementById('bridge-need-zn')) document.getElementById('bridge-need-zn').value = safeFloat(totals.Zn);

    // Show Market Plan Section
    const container = document.getElementById('market-plan-container');
    if (container) {
        container.style.display = 'block';
        container.scrollIntoView({ behavior: 'smooth' });
    }

    // Switch to Mix Tab by default as it's more useful for full plan
    if (typeof switchMarketTab === 'function') switchMarketTab('mix');
};

// Function to handle Emergency Plan Adoption using new nutrients
window.adoptEmergencyPlan = function (tier) {
    const results = window.lastCalculationResult;
    if (!results || !results.emergencyPlan || !results.emergencyPlan[tier]) {
        alert("لا توجد خطة طوارئ متاحة.");
        return;
    }

    const plan = results.emergencyPlan[tier];

    // Construct totals object specifically for this plan
    let totals = { N: 0, P: 0, K: 0, Ca: 0, Mg: 0, S: 0, Fe: 0, Zn: 0 };

    plan.recommendations.forEach(rec => {
        if (rec.nutrient === 'N') totals.N += rec.actualAmount;
        if (rec.nutrient === 'P2O5') totals.P += rec.actualAmount;
        if (rec.nutrient === 'K2O') totals.K += rec.actualAmount;
        if (rec.nutrient === 'CaO') totals.Ca += rec.actualAmount;
        if (rec.nutrient === 'MgO') totals.Mg += rec.actualAmount;
        if (rec.nutrient === 'S') totals.S += rec.actualAmount;
        if (rec.nutrient === 'Fe') totals.Fe += rec.actualAmount;
        if (rec.nutrient === 'Zn') totals.Zn += rec.actualAmount;
    });

    const safe = (val) => val ? Math.ceil(val) : 0;
    const safeFloat = (val) => val ? parseFloat(val.toFixed(2)) : 0;

    if (document.getElementById('bridge-need-n')) document.getElementById('bridge-need-n').value = safe(totals.N);
    if (document.getElementById('bridge-need-p')) document.getElementById('bridge-need-p').value = safe(totals.P);
    if (document.getElementById('bridge-need-k')) document.getElementById('bridge-need-k').value = safe(totals.K);

    if (document.getElementById('bridge-need-ca')) document.getElementById('bridge-need-ca').value = safe(totals.Ca);
    if (document.getElementById('bridge-need-mg')) document.getElementById('bridge-need-mg').value = safe(totals.Mg);
    if (document.getElementById('bridge-need-s')) document.getElementById('bridge-need-s').value = safe(totals.S);
    if (document.getElementById('bridge-need-fe')) document.getElementById('bridge-need-fe').value = safeFloat(totals.Fe);
    if (document.getElementById('bridge-need-zn')) document.getElementById('bridge-need-zn').value = safeFloat(totals.Zn);

    document.getElementById('market-plan-container').style.display = 'block';
    document.getElementById('market-plan-container').scrollIntoView({ behavior: 'smooth' });
};

