const defaultConfig = {
    page_title: "Mutterschutzrechner",
    calculate_button: "Berechnen",
    reset_button: "Zurücksetzen",
    primary_color: "#006e80",
    secondary_color: "#008496"
};

// SDK / Config
async function onConfigChange(config) {
    const pageTitle = config.page_title || defaultConfig.page_title;
    const calculateButton = config.calculate_button || defaultConfig.calculate_button;
    const resetButton = config.reset_button || defaultConfig.reset_button;
    const primaryColor = config.primary_color || defaultConfig.primary_color;
    const secondaryColor = config.secondary_color || defaultConfig.secondary_color;

    document.getElementById('page-title').textContent = pageTitle;
    document.getElementById('calculate-btn').textContent = calculateButton;
    document.getElementById('reset-btn').textContent = resetButton;

    const checkboxInputs = document.querySelectorAll('input[type="checkbox"]');
    checkboxInputs.forEach(input => { input.style.accentColor = primaryColor; });

    const calculateBtn = document.querySelector('.btn-calculate');
    calculateBtn.style.background = primaryColor;

    const hoverStyle = document.getElementById('hover-style') || document.createElement('style');
    hoverStyle.id = 'hover-style';
    hoverStyle.textContent = `.btn-calculate:hover { background: ${secondaryColor} !important; }`;
    if (!document.getElementById('hover-style')) document.head.appendChild(hoverStyle);

    const resultSection = document.querySelector('.result-section');
    resultSection.style.background = primaryColor;
}

function mapToCapabilities(config) {
    return {
        recolorables: [
            { get: () => config.primary_color || defaultConfig.primary_color, set: value => window.elementSdk.setConfig({ primary_color: value }) },
            { get: () => config.secondary_color || defaultConfig.secondary_color, set: value => window.elementSdk.setConfig({ secondary_color: value }) }
        ],
        borderables: [],
        fontEditable: undefined,
        fontSizeable: undefined
    };
}

function mapToEditPanelValues(config) {
    return new Map([
        ["page_title", config.page_title || defaultConfig.page_title],
        ["calculate_button", config.calculate_button || defaultConfig.calculate_button],
        ["reset_button", config.reset_button || defaultConfig.reset_button]
    ]);
}

if (window.elementSdk) {
    window.elementSdk.init({ defaultConfig, onConfigChange, mapToCapabilities, mapToEditPanelValues });
}

// Hilfsfunktionen
function formatDate(date) { return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
function addWeeks(date, weeks) { const result = new Date(date); result.setDate(result.getDate() + (weeks*7)); return result; }
function calculateDaysBetween(date1, date2) { return Math.ceil(Math.abs(date2 - date1) / (1000*60*60*24)); }

// Berechnen
document.getElementById('calculate-btn').addEventListener('click', function(e) {
    e.preventDefault();
    const etDate = document.getElementById('et-date').value;
    const actualDate = document.getElementById('actual-date').value;
    const multipleBirth = document.getElementById('multiple-birth').checked;
    const prematureBirth = document.getElementById('premature-birth').checked;
    const disability = document.getElementById('disability').checked;
    const errorMessage = document.getElementById('error-message');
    errorMessage.classList.remove('show');

    if (!etDate) { errorMessage.textContent = 'Bitte geben Sie den errechneten Entbindungstermin ein.'; errorMessage.classList.add('show'); return; }

    const etDateObj = new Date(etDate);
    const startDate = addWeeks(etDateObj, -6);

    let birthDateForCalculation = actualDate ? new Date(actualDate) : etDateObj;
    let postBirthWeeks = 8;
    let extraInfo = [];

    if (multipleBirth || disability) { postBirthWeeks = 12; if (multipleBirth) extraInfo.push('Mehrlingsgeburt'); if (disability) extraInfo.push('Behinderung'); }
    if (prematureBirth) { postBirthWeeks = 12; extraInfo.push('Medizinische Frühgeburt'); 
        if (actualDate) {
            const actualBirthDate = new Date(actualDate);
            const unusedPreBirthDays = calculateDaysBetween(actualBirthDate, startDate);
            if (actualBirthDate < startDate) {
                const endDate = addWeeks(actualBirthDate, postBirthWeeks);
                endDate.setDate(endDate.getDate() + unusedPreBirthDays);
                document.getElementById('start-date').textContent = formatDate(startDate);
                document.getElementById('end-date').textContent = formatDate(endDate);
                const totalDays = calculateDaysBetween(startDate, endDate);
                document.getElementById('total-duration').textContent = `${Math.floor(totalDays/7)} Wochen und ${totalDays%7} Tage`;
                document.getElementById('info-message').textContent = `Besondere Umstände: ${extraInfo.join(', ')}. Bei Frühgeburt werden ${unusedPreBirthDays} Tage nicht genutzter Mutterschutz vor der Geburt zur Schutzfrist nach der Geburt hinzugefügt.`;
                document.getElementById('results').classList.add('show');
                return;
            }
        }
    }

    const endDate = addWeeks(birthDateForCalculation, postBirthWeeks);
    document.getElementById('start-date').textContent = formatDate(startDate);
    document.getElementById('end-date').textContent = formatDate(endDate);
    const totalDays = calculateDaysBetween(startDate, endDate);
    document.getElementById('total-duration').textContent = `${Math.floor(totalDays/7)} Wochen und ${totalDays%7} Tage`;

    document.getElementById('info-message').textContent = extraInfo.length > 0
        ? `Besondere Umstände: ${extraInfo.join(', ')}. Die Mutterschutzfrist nach der Geburt beträgt ${postBirthWeeks} Wochen.`
        : 'Die Mutterschutzfrist beginnt 6 Wochen vor dem errechneten Entbindungstermin und endet 8 Wochen nach der Geburt.';
    document.getElementById('results').classList.add('show');
});

// Zurücksetzen
document.getElementById('reset-btn').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('et-date').value = '';
    document.getElementById('actual-date').value = '';
    document.getElementById('multiple-birth').checked = false;
    document.getElementById('premature-birth').checked = false;
    document.getElementById('disability').checked = false;
    document.getElementById('results').classList.remove('show');
    document.getElementById('error-message').classList.remove('show');
});
