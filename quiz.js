document.addEventListener('DOMContentLoaded', () => {
    const screens = {
        intro: document.getElementById('quizIntro'),
        steps: document.getElementById('quizSteps'),
        loading: document.getElementById('quizLoading'),
        results: document.getElementById('quizResults')
    };

    const steps = document.querySelectorAll('.quiz-step');
    const progressFill = document.getElementById('progressFill');
    const progressLabel = document.getElementById('progressLabel');
    const progressPct = document.getElementById('progressPct');
    const backBtn = document.getElementById('quizBackBtn');
    const nextBtn = document.getElementById('quizNextBtn');

    let currentStep = 1;
    const totalSteps = steps.length;
    const answers = {};

    // Peptide database
    const peptides = {
        bpc157: {
            name: 'BPC-157',
            subtitle: 'Kroppens naturlige reparasjonspeptid for muskel-, sene- og leddheling.',
            useCases: 'Recovery og helbredelse av skader på muskler, sener, ligamenter og ledd.',
            dosage: '250–500 mcg daglig, subkutant nær skadestedet.',
            cycle: { short: '4–6 uker', medium: '6–8 uker', long: '8–12 uker' },
            summary: 'BPC-157 har vist svært lovende resultater i studier på vevsreparasjon, med signifikant forbedring i helbredelseshastighet for muskler, sener og gastrointestinalt vev.',
            icon: 'heart'
        },
        tb500: {
            name: 'TB-500',
            subtitle: 'Thymosin Beta-4 fragment for cellemigrasjon og vevsgjenoppbygging.',
            useCases: 'Vevsgjenoppbygging, cellefornyelse og systemisk helbredelse.',
            dosage: '2–5 mg to ganger i uken under oppladning, deretter 2 mg ukentlig.',
            cycle: { short: '4–8 uker', medium: '8–12 uker', long: '12–16 uker' },
            summary: 'TB-500 støtter cellemigrasjon og modulerer aktin, et protein som er essensielt for cellebevegelse og reparasjon av skadet vev.',
            icon: 'plus'
        },
        ghkCu: {
            name: 'GHK-Cu',
            subtitle: 'Kobber-peptid for hudfornyelse, kollagen og anti-aging.',
            useCases: 'Hudfornyelse, kollagenproduksjon, sårhelbredelse og anti-aging.',
            dosage: '1–2 mg daglig, subkutant. Også tilgjengelig topisk.',
            cycle: { short: '4–6 uker', medium: '8–12 uker', long: '12–16 uker' },
            summary: 'GHK-Cu har vist betydelig effekt på kollagensyntese, hudtykkelse og elastisitet. Studier viser også antioksidante og anti-inflammatoriske egenskaper.',
            icon: 'star'
        },
        cjc1295: {
            name: 'CJC-1295',
            subtitle: 'Veksthormonfrigjørende peptid for GH-optimalisering.',
            useCases: 'Naturlig GH-støtte, muskelbygging, fettforbrenning og restitusjon.',
            dosage: '100 mcg før sengetid, 5 dager i uken.',
            cycle: { short: '4–8 uker', medium: '8–16 uker', long: '16+ uker' },
            summary: 'CJC-1295 stimulerer pulserende frigjøring av veksthormon via GHRH-reseptorer, med dokumenterte effekter på kroppssammensetning og søvnkvalitet.',
            icon: 'zap'
        },
        ipamorelin: {
            name: 'Ipamorelin',
            subtitle: 'Selektiv GH-sekretagon for søvn, restitusjon og kroppssammensetning.',
            useCases: 'Søvnkvalitet, fettforbrenning, restitusjon og anti-aging.',
            dosage: '200–300 mcg 2–3 ganger daglig, helst fastende.',
            cycle: { short: '4–8 uker', medium: '8–16 uker', long: 'Vedvarende bruk mulig' },
            summary: 'Ipamorelin er en av de mest selektive GH-sekretagonene med minimale bivirkninger. Studier viser forbedret søvnkvalitet og kroppssammensetning.',
            icon: 'moon'
        },
        epithalon: {
            name: 'Epithalon',
            subtitle: 'Telomerase-aktivator for cellulær aldring og immunfunksjon.',
            useCases: 'Anti-aging, cellulær aldring, immunstøtte og telomerlengde.',
            dosage: '5–10 mg daglig i 10–20 dager, gjenta hver 4–6 måned.',
            cycle: { short: '10–20 dager', medium: '20 dager, gjenta etter 4 mnd', long: '20 dager, gjenta hver 4–6 mnd' },
            summary: 'Epithalon aktiverer telomerase-enzymet, som kan forlenge telomerer — de beskyttende endene på kromosomene. Russisk forskning viser lovende resultater på aldring.',
            icon: 'dna'
        },
        semaglutide: {
            name: 'Semaglutide',
            subtitle: 'GLP-1 reseptoragonist for metabolsk og appetittregulering.',
            useCases: 'Metabolisme- og appetittregulering, glykemisk kontroll.',
            dosage: '0.25 mg ukentlig, gradvis opptrapping.',
            cycle: { short: '8–12 uker', medium: '12–16 uker', long: '16+ uker' },
            summary: 'GLP-1-agonister har vist sterke resultater i metabolske studier, med signifikant effekt på glykemisk kontroll og kroppssammensetning.',
            icon: 'flame'
        }
    };

    // Matching rules: [goal][priority] → peptide keys
    const matchRules = {
        recovery: {
            primary: ['bpc157', 'tb500'],
            secondary: ['tb500', 'ipamorelin']
        },
        fatLoss: {
            primary: ['semaglutide', 'cjc1295'],
            secondary: ['ipamorelin', 'cjc1295']
        },
        muscle: {
            primary: ['cjc1295', 'ipamorelin'],
            secondary: ['bpc157', 'tb500']
        },
        sleep: {
            primary: ['ipamorelin', 'cjc1295'],
            secondary: ['epithalon', 'bpc157']
        },
        skin: {
            primary: ['ghkCu', 'epithalon'],
            secondary: ['epithalon', 'ghkCu']
        }
    };

    function showScreen(name) {
        Object.values(screens).forEach(s => s.classList.remove('active'));
        screens[name].classList.add('active');
    }

    function updateProgress() {
        const pct = Math.round((currentStep / totalSteps) * 100);
        progressFill.style.width = pct + '%';
        progressLabel.textContent = `Spørsmål ${currentStep} av ${totalSteps}`;
        progressPct.textContent = pct + '%';
    }

    function showStep(n) {
        steps.forEach(s => s.classList.remove('active'));
        const target = document.querySelector(`.quiz-step[data-step="${n}"]`);
        if (target) target.classList.add('active');
        currentStep = n;
        updateProgress();

        backBtn.classList.toggle('hidden', currentStep === 1);

        if (currentStep === totalSteps) {
            nextBtn.querySelector('span').textContent = 'Se Resultater';
        } else {
            nextBtn.querySelector('span').textContent = 'Neste';
        }

        updateNextState();
    }

    function updateNextState() {
        const currentStepEl = document.querySelector(`.quiz-step[data-step="${currentStep}"]`);
        const selected = currentStepEl.querySelector('input:checked');
        nextBtn.disabled = !selected;
    }

    function getRecommendation() {
        const goal = answers.goal || 'recovery';
        const rules = matchRules[goal] || matchRules.recovery;

        let primaryKey = rules.primary[0];
        let secondaryKey = rules.secondary.find(k => k !== primaryKey) || rules.secondary[0];

        // Age-based adjustments
        if (answers.age === '45+') {
            if (goal === 'recovery') secondaryKey = 'epithalon';
            if (goal === 'muscle') secondaryKey = 'epithalon';
        }
        if (answers.age === '18-30' && goal === 'muscle') {
            primaryKey = 'ipamorelin';
            secondaryKey = 'cjc1295';
        }

        // Activity-based adjustments
        if (answers.activity === 'intense' && goal === 'recovery') {
            primaryKey = 'bpc157';
            secondaryKey = 'tb500';
        }
        if (answers.activity === 'sedentary' && goal === 'fatLoss') {
            primaryKey = 'semaglutide';
        }

        const tf = answers.timeframe || 'medium';
        return {
            primary: { ...peptides[primaryKey], cycleDisplay: peptides[primaryKey].cycle[tf] },
            secondary: { ...peptides[secondaryKey], cycleDisplay: peptides[secondaryKey].cycle[tf] }
        };
    }

    function renderResults(rec) {
        document.getElementById('recName').textContent = rec.primary.name;
        document.getElementById('recSubtitle').textContent = rec.primary.subtitle;
        document.getElementById('recUseCases').textContent = rec.primary.useCases;
        document.getElementById('recDosage').textContent = rec.primary.dosage;
        document.getElementById('recCycle').textContent = rec.primary.cycleDisplay;
        document.getElementById('recSummary').textContent = rec.primary.summary;

        document.getElementById('recName2').textContent = rec.secondary.name;
        document.getElementById('recSubtitle2').textContent = rec.secondary.subtitle;
        document.getElementById('recUseCases2').textContent = rec.secondary.useCases;
        document.getElementById('recCycle2').textContent = rec.secondary.cycleDisplay;
    }

    function runLoadingSequence() {
        showScreen('loading');
        const ls = [document.getElementById('ls1'), document.getElementById('ls2'), document.getElementById('ls3')];

        setTimeout(() => { ls[0].classList.add('active'); }, 200);
        setTimeout(() => {
            ls[0].classList.remove('active');
            ls[0].classList.add('done');
            ls[0].querySelector('svg').innerHTML = '<path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/>';
            ls[1].classList.add('active');
        }, 1200);
        setTimeout(() => {
            ls[1].classList.remove('active');
            ls[1].classList.add('done');
            ls[1].querySelector('svg').innerHTML = '<path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/>';
            ls[2].classList.add('active');
        }, 2200);
        setTimeout(() => {
            ls[2].classList.remove('active');
            ls[2].classList.add('done');
            ls[2].querySelector('svg').innerHTML = '<path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/>';
        }, 3000);
        setTimeout(() => {
            const rec = getRecommendation();
            renderResults(rec);
            showScreen('results');
        }, 3500);
    }

    // Event: Start
    document.getElementById('quizStartBtn').addEventListener('click', () => {
        showScreen('steps');
        showStep(1);
    });

    // Event: Option select
    document.querySelectorAll('.quiz-option input').forEach(input => {
        input.addEventListener('change', () => {
            answers[input.name] = input.value;
            updateNextState();
            // Auto-advance after short delay
            setTimeout(() => {
                if (currentStep < totalSteps) {
                    showStep(currentStep + 1);
                }
            }, 350);
        });
    });

    // Event: Next
    nextBtn.addEventListener('click', () => {
        if (currentStep < totalSteps) {
            showStep(currentStep + 1);
        } else {
            runLoadingSequence();
        }
    });

    // Event: Back
    backBtn.addEventListener('click', () => {
        if (currentStep > 1) showStep(currentStep - 1);
    });

    // Event: Retake
    document.getElementById('quizRetakeBtn').addEventListener('click', () => {
        document.querySelectorAll('.quiz-option input').forEach(i => { i.checked = false; });
        Object.keys(answers).forEach(k => delete answers[k]);
        showScreen('intro');
    });

    // Keyboard nav
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !nextBtn.disabled && screens.steps.classList.contains('active')) {
            nextBtn.click();
        }
    });
});
