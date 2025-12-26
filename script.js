let allSurahs = [], currentSurahId = 1;
let isMuted = localStorage.getItem('isMuted') === 'true';
const audio = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playBtn');
const seekSlider = document.getElementById('seekSlider');
const notifySound = document.getElementById('notificationSound');
function switchMainTab(tabName) {
    console.log("تم الضغط على قسم: " + tabName); // للتأكد في الـ Console

    // 1. إخفاء جميع الأقسام يدوياً وبقوة
    const sections = ['quran-section', 'azkar-section', 'sebha-section', 'prayer-section', 'qibla-section', 'khatma-section', 'names-section'];
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.setAttribute('style', 'display: none !important');
        }
    });

    // 2. إظهار القسم المطلوب
    const targetId = tabName + '-section';
    const targetEl = document.getElementById(targetId);
    if (targetEl) {
        targetEl.setAttribute('style', 'display: block !important');
        console.log("تم إظهار: " + targetId);
    } else {
        console.error("لم يتم العثور على القسم: " + targetId);
    }

    // 3. تشغيل الدالة الخاصة بالقسم إذا وجدت
    if (tabName === 'names') initNamesGrid();
    if (tabName === 'khatma') updateKhatmaUI();
    if (tabName === 'prayer') fetchPrayers();

    // 4. إغلاق القائمة
    if (document.getElementById('sideMenu')) {
        document.getElementById('sideMenu').classList.remove('open');
    }
}

// --- 1. القائمة الجانبية والإعدادات ---
function toggleMenu() { document.getElementById('sideMenu').classList.toggle('open'); }
function toggleMute() { 
    isMuted = !isMuted; 
    localStorage.setItem('isMuted', isMuted); 
    document.getElementById('muteBtn').innerText = isMuted ? "🔇" : "🔊"; 
}
function playNotify() { 
    if (!isMuted) { 
        notifySound.currentTime = 0; 
        notifySound.play().catch(e => console.log("Audio play failed")); 
    } 
}

// --- 2. القرآن الكريم ---
fetch('https://api.alquran.cloud/v1/surah').then(res => res.json()).then(data => { 
    allSurahs = data.data; 
    displaySurahs(allSurahs); 
});

function displaySurahs(surahs) { 
    const list = document.getElementById('surahList');
    list.innerHTML = surahs.map(s => `<div class="surah-card" onclick="openSurah(${s.number}, '${s.name}')">${s.number}. ${s.name}</div>`).join(''); 
}

function filterSurahs() { 
    const term = document.getElementById('searchInput').value; 
    displaySurahs(allSurahs.filter(s => s.name.includes(term))); 
}

function openSurah(id, name) {
    currentSurahId = id;
    // إغلاق القائمة الجانبية إذا كانت مفتوحة
    document.getElementById('sideMenu').classList.remove('open');
    
    // إخفاء قائمة السور والفهرس الموضوعي
    document.getElementById('full-quran-view').style.display = 'none';
    document.getElementById('topics-view').style.display = 'none';
    
    // إظهار واحة عرض السورة (الآيات والمشغل)
    document.getElementById('quran-view').style.display = 'block';
    document.getElementById('current-surah-title').innerText = name;
    
    updateAudioSource();
    
    // جلب الآيات من الرابط
    fetch(`https://api.alquran.cloud/v1/surah/${id}`).then(res => res.json()).then(data => {
        document.getElementById('ayahsContainer').innerHTML = data.data.ayahs.map(a => 
            `${a.text} <span style="color:var(--gold); font-size: 1.1rem;">(${a.numberInSurah})</span>`
        ).join(' ');
    });
// داخل دالة openSurah(id, name)
if (typeof checkKhatmaProgress === "function") {
    checkKhatmaProgress(id);
}
}



function showMain() { 
    document.getElementById('main-view').style.display = 'block'; 
    document.getElementById('quran-view').style.display = 'none'; 
    audio.pause(); 
    if(playBtn) playBtn.innerText = "▷";
}

function updateAudioSource() {
    const r = document.getElementById('reciterSelect').value;
    const srv = { 'afs': '8', 'minsh': '10', 'basit': '7', 'husr': '13', 'maher': '12', 'qtm': '11', 'yasser': '11' };
    audio.src = `https://server${srv[r]}.mp3quran.net/${r}/${currentSurahId.toString().padStart(3, '0')}.mp3`;
    if (!audio.paused) audio.play();
}

function toggleAudio() { 
    if (audio.paused) { audio.play(); playBtn.innerText = "||"; } 
    else { audio.pause(); playBtn.innerText = "▷"; } 
}

audio.ontimeupdate = () => { 
    if (audio.duration) { 
        seekSlider.value = (audio.currentTime / audio.duration) * 100; 
        document.getElementById('currentTime').innerText = formatTime(audio.currentTime); 
        document.getElementById('durationTime').innerText = formatTime(audio.duration); 
    } 
};

function seekAudio() { audio.currentTime = (seekSlider.value / 100) * audio.duration; }
function formatTime(s) { const m = Math.floor(s/60); const sc = Math.floor(s%60); return `${m}:${sc<10?'0'+sc:sc}`; }

// --- 3. قاعدة بيانات الأذكار والأدعية (موسعة ومفصلة) ---
const azkarData = {
    morning: [
        { id: "m1", text: "أعوذ بالله من الشيطان الرجيم: {اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحيطُونَ بِشَيْءٍ مِنْ عليمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ}", count: 1 },
        { id: "m2", text: "بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيمِ: {قُلْ هُوَ اللَّهُ أَحَدٌ * اللَّهُ الصَّمَدُ * لَمْ يَلِدْ وَلَمْ يُولَدْ * وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ}", count: 3 },
        { id: "m3", text: "بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيمِ: {قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ * مِنْ شَرِّ مَا خَلَقَ * وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ * وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ * وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ}", count: 3 },
        { id: "m4", text: "بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيمِ: {قُلْ أَعُوذُ بِرَبِّ النَّاسِ * مَلِكِ النَّاسِ * إِلَهِ النَّاسِ * مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ * الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ * مِنَ الْجِنَّةِ وَالنَّاسِ}", count: 3 },
        { id: "m5", text: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.", count: 1 },
        { id: "m5_2", text: "رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ.", count: 1 },
        { id: "m5_3", text: "رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابِ فِي النَّارِ وَعَذَابِ فِي الْقَبْرِ.", count: 1 },
        { id: "m6", text: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أنتَ.", count: 1 },
        { id: "m7", text: "اللَّهُمَّ إِنِّي أَصْبَحْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلَائِكَتَكَ وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللَّهُ لَا إِلَهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيكَ لَكَ، وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ.", count: 4 },
        { id: "m8", text: "اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ.", count: 1 },
        { id: "m9", text: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ.", count: 3 },
        { id: "m10", text: "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا.", count: 3 },
        { id: "m11", text: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ أَصْلِحْ لِي شأْنِي كُلَّهُ وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ.", count: 1 },
        { id: "m16", text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ.", count: 100 },
        { id: "m17", text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.", count: 10 }
    ],
    evening: [
        { id: "e1", text: "أعوذ بالله من الشيطان الرجيم (آية الكرسي)", count: 1 },
        { id: "e2", text: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.", count: 1 },
        { id: "e3", text: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ.", count: 1 },
        { id: "e4", text: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.", count: 3 },
        { id: "e5", text: "اللَّهُمَّ مَا أَمْسَى بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ.", count: 1 },
        { id: "e6", text: "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ.", count: 7 }
    ],
    sleep: [
        { id: "s1", text: "بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ.", count: 1 },
        { id: "s2", text: "اللَّهُمَّ خَلَقْتَ نَفْسِي وَأَنْتَ تَوَفَّاهَا، لَكَ مَمَاتُهَا وَمَحْيَاهَا، إِنْ أَحْيَيْتَهَا فَاحْفَظْهَا، وَإِنْ أَمَتَّهَا فَاغْفِرْ لَهَا.", count: 1 },
        { id: "s3", text: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا.", count: 1 },
        { id: "s4_1", text: "سُبْحَانَ اللَّهِ", count: 33 },
        { id: "s4_2", text: "الْحَمْدُ لِلَّهِ", count: 33 },
        { id: "s4_3", text: "اللَّهُ أَكْبَرُ", count: 34 },
        { id: "s5", text: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ.", count: 3 }
    ],
    afterPrayer: [
        { id: "p1", text: "أَسْتَغْفِرُ اللَّهَ", count: 3 },
        { id: "p2", text: "اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ.", count: 1 },
        { id: "p3", text: "سُبْحَانَ اللَّهِ", count: 33 },
        { id: "p4", text: "الْحَمْدُ لِلَّهِ", count: 33 },
        { id: "p5", text: "اللَّهُ أَكْبَرُ", count: 33 },
        { id: "p6", text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.", count: 1 },
        { id: "p7", text: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ، وَشُكْرِكَ، وَحُسْنِ عِبَادَتِكَ.", count: 1 }
    ],
    generalDuas: [
        { id: "d1", text: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ.", count: 1 },
        { id: "d2", text: "يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ.", count: 1 },
        { id: "d3", text: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي.", count: 1 },
        { id: "d4", text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى.", count: 1 },
        { id: "d5", text: "اللَّهُمَّ اغْفِرْ لِي، وَارْحَمْنِي، وَاهْدِنِي، وَعَافِنِي، وَارْزُقْنِي.", count: 1 },
        { id: "d6", text: "لا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ.", count: 1 },
        { id: "d7", text: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ.", count: 10 }
    ]
};

// --- 4. وظائف الأذكار ---
function loadAzkar(cat) {
    document.getElementById('azkarCats').style.display = 'none';
    document.getElementById('azkar-content').style.display = 'block';
    const list = document.getElementById('azkarList');
    
    const titles = { 
        morning: 'أذكار الصباح', evening: 'أذكار المساء', 
        sleep: 'أذكار النوم', afterPrayer: 'بعد الصلاة',
        generalDuas: 'أدعية عامة' 
    };
    
    document.getElementById('azkar-title').innerText = titles[cat] || 'الأذكار';

    list.innerHTML = azkarData[cat].map(z => {
        let saved = localStorage.getItem(`zekr_${z.id}`);
        let cur = saved !== null ? parseInt(saved) : z.count;
        return `
            <div class="zekr-card ${cur === 0 ? 'completed' : ''}" onclick="countZekr('${z.id}')">
                <div class="zekr-text">${z.text}</div>
                <div class="zekr-counter">المتبقي: <span id="num-${z.id}">${cur}</span></div>
            </div>`;
    }).join('');
}

function countZekr(id) {
    const el = document.getElementById(`num-${id}`);
    if (!el) return;
    let c = parseInt(el.innerText);
    if (c > 0) {
        c--; el.innerText = c;
        localStorage.setItem(`zekr_${id}`, c);
        if (c === 0) {
            el.closest('.zekr-card').classList.add('completed');
            playNotify(); 
        }
    }
}

function backToAzkarCats() { 
    document.getElementById('azkarCats').style.display = 'grid'; 
    document.getElementById('azkar-content').style.display = 'none'; 
}

function resetAzkarProgress() { 
    if (confirm("تصفير عدادات الأذكار؟")) { 
        Object.keys(localStorage).forEach(k => { if (k.startsWith('zekr_')) localStorage.removeItem(k); }); 
        location.reload(); 
    } 
}

// --- 5. السبحة والعداد التلقائي ---
let sCount = parseInt(localStorage.getItem('sebhaCount')) || 0;
let sGoal = parseInt(localStorage.getItem('sebhaGoal')) || 100;

function updateGoal() {
    sGoal = parseInt(document.getElementById('sebhaGoal').value);
    localStorage.setItem('sebhaGoal', sGoal);
    updateProgress();
}

function incrementSebha() {
    sCount++;
    document.getElementById('sebhaCounter').innerText = sCount;
    localStorage.setItem('sebhaCount', sCount);
    updateProgress();
    
    if (sCount === sGoal) {
        document.querySelector('.sebha-circle').classList.add('goal-reached');
        playNotify(); 
    }
}

function updateProgress() {
    let percent = Math.min((sCount / sGoal) * 100, 100);
    const bar = document.getElementById('sebhaBar');
    if(bar) bar.style.width = percent + "%";
}

function resetSebha() {
    if(confirm("تصفير السبحة؟")) {
        sCount = 0;
        document.getElementById('sebhaCounter').innerText = 0;
        document.querySelector('.sebha-circle').classList.remove('goal-reached');
        localStorage.setItem('sebhaCount', 0);
        updateProgress();
    }
}

function updateCountdown() {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const diff = tomorrow - now;

    if (diff <= 0) { resetSebhaAutomated(); }

    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    const timerDisplay = document.getElementById('countdown-timer');
    if(timerDisplay) {
        timerDisplay.innerText = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
}

function resetSebhaAutomated() {
    sCount = 0;
    document.getElementById('sebhaCounter').innerText = 0;
    localStorage.setItem('sebhaCount', 0);
    updateProgress();
}

setInterval(updateCountdown, 1000);

// --- 6. الوضع الداكن والخط والتبديل ---

function toggleDarkMode() { document.body.classList.toggle('dark-mode'); }
function changeFontSize(d) { 
    const el = document.getElementById('ayahsContainer'); 
    let s = window.getComputedStyle(el).fontSize; 
    el.style.fontSize = (parseFloat(s) + d) + 'px'; 
}

// --- تهيئة التشغيل ---
document.getElementById('sebhaCounter').innerText = sCount;
document.getElementById('sebhaGoal').value = sGoal;
document.getElementById('muteBtn').innerText = isMuted ? "🔇" : "🔊";
updateProgress();
updateCountdown();
let prayerTimesData = null;

// 1. جلب المواقيت بناءً على موقع المستخدم
function fetchPrayers() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            const url = `https://api.aladhan.com/v1/timings?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&method=4`;
            fetch(url).then(res => res.json()).then(data => {
                prayerTimesData = data.data.timings;
                updatePrayerUI();
                startPrayerCountdown();
            });
        });
    }
}

// 2. تحديث جدول الأوقات
function updatePrayerUI() {
    if(!prayerTimesData) return;
    document.getElementById('fajr-time').innerText = prayerTimesData.Fajr;
    document.getElementById('dhuhr-time').innerText = prayerTimesData.Dhuhr;
    document.getElementById('asr-time').innerText = prayerTimesData.Asr;
    document.getElementById('maghrib-time').innerText = prayerTimesData.Maghrib;
    document.getElementById('isha-time').innerText = prayerTimesData.Isha;
}

// 3. العداد التنازلي للصلاة القادمة
function startPrayerCountdown() {
    setInterval(() => {
        if (!prayerTimesData) return;
        const now = new Date();
        const prayers = [
            {n: "الفجر", t: prayerTimesData.Fajr},
            {n: "الظهر", t: prayerTimesData.Dhuhr},
            {n: "العصر", t: prayerTimesData.Asr},
            {n: "المغرب", t: prayerTimesData.Maghrib},
            {n: "العشاء", t: prayerTimesData.Isha}
        ];

        let next = null;
        for (let p of prayers) {
            const [h, m] = p.t.split(':');
            const d = new Date(); d.setHours(h, m, 0);
            if (d > now) { next = {n: p.n, d: d}; break; }
        }

        if (!next) { // لو انتهت صلوات اليوم، الصلاة القادمة فجر الغد
            const [h, m] = prayers[0].t.split(':');
            const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(h, m, 0);
            next = {n: "الفجر", d: d};
        }

        const diff = next.d - now;
        const hh = Math.floor(diff / 3600000).toString().padStart(2, '0');
        const mm = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
        const ss = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');

        document.getElementById('next-prayer-name').innerText = `الصلاة القادمة: ${next.n}`;
        document.getElementById('next-prayer-timer').innerText = `${hh}:${mm}:${ss}`;
    }, 1000);
}
// --- 7. وظائف القبلة (نسخة السرعة القصوى) ---

// --- 7. وظائف القبلة (نسخة السرعة والحركة الحية) ---
let finalQiblaAngle = 0;

function getQibla() {
    if (navigator.geolocation) {
        document.getElementById('qibla-status').innerText = "جاري تحديد موقعك...";

        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            // حساب زاوية مكة
            const phiK = 21.4225 * Math.PI / 180;
            const lambdaK = 39.8262 * Math.PI / 180;
            const phi = lat * Math.PI / 180;
            const lambda = lng * Math.PI / 180;
            let qDeg = Math.atan2(Math.sin(lambdaK - lambda), Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lambdaK - lambda));
            finalQiblaAngle = (qDeg * 180 / Math.PI + 360) % 360;
            
            document.getElementById('qibla-deg').innerText = Math.round(finalQiblaAngle);
            
            // تحديث الرسالة لطلب تفعيل الحساس
            document.getElementById('qibla-status').innerHTML = `
                <button onclick="askCompassPermission()" style="background:var(--gold); color:var(--dark-teal); border:none; padding:8px 15px; border-radius:10px; font-weight:bold; cursor:pointer; font-family:inherit;">
                    تفعيل حركة البوصلة 🧭
                </button>`;
        }, (err) => {
            document.getElementById('qibla-status').innerText = "يرجى تفعيل الموقع";
        }, { enableHighAccuracy: false, timeout: 5000 });
    }
}

// دالة طلب الإذن للحساسات (ضرورية لـ iOS)
function askCompassPermission() {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
            .then(state => {
                if (state === 'granted') {
                }
            }).catch(e => console.error(e));
    } else {
         }
}

function handleCompass(e) {
    let compass = e.webkitCompassHeading || (360 - e.alpha);
    if (compass === undefined) return;

    const rotateDeg = finalQiblaAngle - compass;
    const pointer = document.getElementById('compass-pointer');
    const statusText = document.getElementById('qibla-status');

    if (pointer) {
        pointer.style.transform = `translate(-50%, -100%) rotate(${rotateDeg}deg)`;

        // التحقق من الاتجاه الصحيح (فرق 5 درجات)
        const isCorrect = Math.abs(rotateDeg % 360) < 5 || Math.abs(rotateDeg % 360) > 355;
        
        if (isCorrect) {
            pointer.style.backgroundColor = "#27ae60"; 
            pointer.style.boxShadow = "0 0 15px #27ae60";
            statusText.innerHTML = "<span style='color:#27ae60; font-weight:bold;'>أنت باتجاه القبلة الآن ✅</span>";
        } else {
            pointer.style.backgroundColor = "var(--gold)";
            pointer.style.boxShadow = "none";
            statusText.innerHTML = "<span style='color:var(--gold);'>دوّر الجوال لضبط الاتجاه</span>";
        }
    }
}

// دالة التبديل الشاملة (تأكد أنها الوحيدة في المل
// دالة جلب آية اليوم بناءً على تاريخ اليوم
async function loadDailyAyah() {
    try {
        const now = new Date();
        // استخدام رقم اليوم في السنة للحصول على آية متجددة يومياً
        const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
        
        const response = await fetch(`https://api.alquran.cloud/v1/ayah/${dayOfYear}/ar.alafasy`);
        const data = await response.json();
        
        if(data.code === 200) {
            document.getElementById('daily-text').innerText = data.data.text;
            document.getElementById('daily-ref').innerText = `[سورة ${data.data.surah.name} - آية ${data.data.numberInSurah}]`;
        }
    } catch (error) {
        document.getElementById('daily-text').innerText = "فذكر بالقرآن من يخاف وعيد";
    }
}

// دالة نسخ الآية
function copyDailyAyah() {
    const text = document.getElementById('daily-text').innerText;
    const ref = document.getElementById('daily-ref').innerText;
    navigator.clipboard.writeText(text + " " + ref);
    alert("تم نسخ الآية بنجاح");
}

// تشغيل الدالة تلقائياً عند تحميل الصفحة


// 1. طلب إذن الإشعارات من المستخدم
function requestNotificationPermission() {
    if (!("Notification" in window)) {
        alert("عذراً، متصفحك لا يدعم الإشعارات");
        return;
    }
    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            document.getElementById('notifBtn').classList.add('enabled');
            alert("تم تفعيل تنبيهات الأذان بنجاح ✅ (سيصلك الإشعار عند وقت الصلاة)");
        } else {
            alert("يجب السماح بالإشعارات لكي يعمل المنبه");
        }
    });
}

// 2. دالة إرسال الإشعار وتشغيل صوت الأذان
function triggerAzanNotification(prayerName) {
    if (Notification.permission === "granted") {
        // إرسال الإشعار المرئي
        new Notification("حقيبة المؤمن", {
            body: `حان الآن موعد أذان ${prayerName}`,
            icon: "https://cdn-icons-png.flaticon.com/512/2972/2972331.png" // أيقونة إسلامية
        });

        // تشغيل صوت الأذان
        const azan = document.getElementById('azanSound');
        if (azan) {
            azan.currentTime = 0; // البدء من أول الملف الصوتي
            azan.play().catch(e => {
                console.log("تنبيه: المتصفح يتطلب ضغطة واحدة من المستخدم في الموقع لتفعيل الصوت تلقائياً.");
            });
            
            // إيقاف الأذان تلقائياً بعد دقيقة واحدة (60000 مللي ثانية)
            setTimeout(() => {
                azan.pause();
                azan.currentTime = 0;
            }, 60000);
        }
    }
}

// 3. المحرك (يفحص كل 60 ثانية إذا كان الوقت الحالي يطابق وقت الصلاة)
setInterval(() => {
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ":" + 
                        now.getMinutes().toString().padStart(2, '0');

    // جلب أوقات الصلاة من العناصر الموجودة في صفحتك
    const prayerTimes = {
        "الفجر": document.getElementById('fajr-time')?.innerText,
        "الظهر": document.getElementById('dhuhr-time')?.innerText,
        "العصر": document.getElementById('asr-time')?.innerText,
        "المغرب": document.getElementById('maghrib-time')?.innerText,
        "العشاء": document.getElementById('isha-time')?.innerText
    };

    for (let name in prayerTimes) {
        if (prayerTimes[name] === currentTime) {
            // التحقق لمنع تكرار الإشعار في نفس الدقيقة
            if (window.lastNotifiedPrayer !== name + currentTime) {
                triggerAzanNotification(name);
                window.lastNotifiedPrayer = name + currentTime;
            }
        }
    }
}, 60000);
// دالة فتح وإغلاق القائمة المنسدلة
function toggleQuranDropdown(event) {
    event.stopPropagation();
    document.getElementById("quranDropdown").classList.toggle("show-dropdown");
}

// دالة اختيار الخيار المطلوب
// 1. تعديل دالة اختيار خيار القرآن
function selectQuranOption(option) {
    document.getElementById("quranDropdown").classList.remove("show-dropdown");
    switchMainTab('quran'); 

    const fullView = document.getElementById('full-quran-view');
    const topicsView = document.getElementById('topics-view');
    const quranView = document.getElementById('quran-view');
    const searchBox = document.querySelector('.search-box'); // تحديد مربع البحث

    if (option === 'quran') {
        fullView.style.display = 'block';
        topicsView.style.display = 'none';
        quranView.style.display = 'none';
        if (searchBox) searchBox.style.display = 'block'; // إظهار البحث في المصحف الكامل
        displaySurahs(allSurahs); 
        document.getElementById('searchInput').value = '';
    } else if (option === 'topics') {
        fullView.style.display = 'none';
        topicsView.style.display = 'block';
        quranView.style.display = 'none';
        if (searchBox) searchBox.style.display = 'none'; // إخفاء البحث في الفهرس
    }
}


// 2. إضافة دالة عرض سور القسم المختار
function showTopicSurahs(title, surahNumbers) {
    document.getElementById('full-quran-view').style.display = 'block';
    document.getElementById('topics-view').style.display = 'none';
    
    // إخفاء مربع البحث عند الدخول لقسم معين
    const searchBox = document.querySelector('.search-box');
    if (searchBox) searchBox.style.display = 'none';
    
    // إظهار زر العودة للأقسام
    let backBtn = document.getElementById('backToTopicsContainer');
    if (!backBtn) {
        // إذا لم يكن الزر موجوداً، نقوم بإنشائه برمجياً ووضعه مكان البحث
        const container = document.createElement('div');
        container.id = 'backToTopicsContainer';
        container.style.textAlign = 'center';
        container.style.margin = '20px 0';
        container.innerHTML = `<button class="modern-back-btn" onclick="returnToAllTopics()">↩ العودة لجميع الأقسام</button>`;
        searchBox.parentNode.insertBefore(container, searchBox.nextSibling);
    } else {
        backBtn.style.display = 'block';
    }
    
    const filtered = allSurahs.filter(s => surahNumbers.includes(parseInt(s.number)));
    displaySurahs(filtered);
}

// دالة العودة التي تعيد إظهار البحث وإخفاء الزر
function returnToAllTopics() {
    document.getElementById('full-quran-view').style.display = 'none';
    document.getElementById('topics-view').style.display = 'block';
    document.getElementById('backToTopicsContainer').style.display = 'none';
    document.querySelector('.search-box').style.display = 'block';
}


// 3. تعديل دالة العودية (showMain)
function showMain() { 
    document.getElementById('full-quran-view').style.display = 'block'; 
    document.getElementById('quran-view').style.display = 'none'; 
    document.getElementById('topics-view').style.display = 'none'; 
    if(audio) audio.pause(); 
    if(playBtn) playBtn.innerText = "▷";
}
// 1. نظام إدارة البيانات الجديد
let khatmaData = JSON.parse(localStorage.getItem('khatmaProgress')) || null;

function updateKhatmaUI() {
    // 1. جلب البيانات من الذاكرة
    khatmaData = JSON.parse(localStorage.getItem('khatmaProgress')) || null;

    const startView = document.getElementById('start-khatma-view');
    const activeView = document.getElementById('active-khatma-view');
    const readingArea = document.getElementById('khatma-reading-area');

    // التأكد من وجود العناصر قبل العمل عليها لتجنب الأخطاء
    if (!startView || !activeView || !readingArea) return;

    if (!khatmaData) {
        // حالة: لم يبدأ التحدي بعد
        startView.style.display = 'block';
        activeView.style.display = 'none';
        readingArea.style.display = 'none';
        
        document.getElementById('totalKhatmaBar').style.width = "0%";
        document.getElementById('total-percent-text').innerText = "التقدم الكلي: 0%";
    } else {
        // حالة: التحدي نشط
        startView.style.display = 'none';
        activeView.style.display = 'block';
        // نخفي منطقة القراءة إلا إذا ضغط المستخدم على "تابع القراءة"
        readingArea.style.display = 'none'; 
        
        document.getElementById('daily-task-title').innerText = `ورد اليوم (الجزء ${khatmaData.currentJuz})`;
        document.getElementById('khatma-start-date').innerText = `تاريخ البدء: ${khatmaData.startDate}`;

        // تحديث شريط التقدم الكلي
        const totalPercent = Math.round(((khatmaData.currentJuz - 1) / 30) * 100);
        document.getElementById('totalKhatmaBar').style.width = totalPercent + "%";
        document.getElementById('total-percent-text').innerText = `التقدم الكلي: ${totalPercent}%`;
        
        // تشغيل العداد التنازلي لنهاية اليوم
        if (typeof startKhatmaTimer === 'function') {
            startKhatmaTimer();
            }
    }
}
// 2. دالة البداية لأول مرة
function initializeKhatma() {
    const today = new Date();
    khatmaData = {
        currentJuz: 1,
        lastAyahIndex: 0,
        startDate: today.toLocaleDateString('ar-EG'),
        startTime: today.getTime()
    };
    localStorage.setItem('khatmaProgress', JSON.stringify(khatmaData));
    updateKhatmaUI();
}

// 3. عداد الوقت (حتى نهاية اليوم)
function startKhatmaTimer() {
    setInterval(() => {
        const now = new Date();
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const diff = tomorrow - now;

        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        const timerEl = document.getElementById('time-left');
        if (timerEl) {
            timerEl.innerText = `${hours} ساعة و ${minutes} دقيقة`;
        }
    }, 1000);
}

// 4. حذف التقدم والبدء من جديد
function resetKhatma() {
    if (confirm("هل تريد حقاً إعادة التحدي من البداية؟ سيتم حذف كل تقدمك.")) {
        localStorage.removeItem('khatmaProgress');
        khatmaData = null;
        updateKhatmaUI();
    }
}

// بيانات أسماء الله الحسنى (عينة للتجربة - يمكنك إكمال الـ 99 بنفس النمط)
const namesData = [
    { name: "الله", desc: "العلم على الذات الواجب الوجود، المستحق لكل المحامد، وهو الاسم الجامع لكل معاني الأسماء الحسنى.", count: "ورد في القرآن 2702 مرة." },
    { name: "الرحمن", desc: "كثير الرحمة، وهو اسم مقصور على الله عز وجل ولا يجوز أن يقال لغيره.", count: "ورد في القرآن 57 مرة." },
    { name: "الرحيم", desc: "المنعم على عباده المؤمنين بالهداية والثبات ثم الجزاء بالجنة في الآخرة.", count: "ورد في القرآن 114 مرة." },
    { name: "الملك", desc: "الذي يملك كل شيء في هذا الكون، والمتصرف فيه بلا منازع ولا شريك.", count: "ورد في القرآن 5 مرات." },
    { name: "القدوس", desc: "المنزه عن كل نقص وعيب، والمقدس الذي لا يشبهه أحد من خلقه.", count: "ورد في القرآن مرتان." },
    { name: "السلام", desc: "الذي سلم من كل عيب، والذي ينشر السلام والأمن بين خلقه.", count: "ورد في القرآن مرة واحدة." },
    { name: "المؤمن", desc: "الذي يصدق عباده وعوده، والذي أمن خلقه من ظلمه.", count: "ورد في القرآن مرة واحدة." },
    { name: "المهيمن", desc: "المطلع على خفايا الأمور، والرقيب الحافظ لكل شيء.", count: "ورد في القرآن مرة واحدة." },
    { name: "العزيز", desc: "القوي الغالب الذي لا يُغلب، صاحب العزة والمنعة.", count: "ورد في القرآن 92 مرة." },
    { name: "الجبار", desc: "الذي يجبر كسر القلوب، والمنفذ لمشيئته في خلقه قهرًا وعدلًا.", count: "ورد في القرآن مرة واحدة." },
    { name: "المتكبر", desc: "المنفرد بصفات العظمة والكبرياء، المتعالي عن صفات الخلق.", count: "ورد في القرآن مرة واحدة." },
    { name: "الخالق", desc: "المبدع للموجودات من العدم على غير مثال سابق.", count: "ورد في القرآن 8 مرات." },
    { name: "البارئ", desc: "الذي خلق الخلق بريئًا من التفاوت أو العيب، والموجد للأشياء من العدم.", count: "ورد في القرآن 3 مرات." },
    { name: "المصور", desc: "الذي أعطى لكل مخلوق صورته الخاصة وهيئته المميزة.", count: "ورد في القرآن مرة واحدة." },
    { name: "الغفار", desc: "الذي يستر الذنوب مرة بعد مرة في الدنيا ويتجاوز عنها في الآخرة.", count: "ورد في القرآن 5 مرات." },
    { name: "القهار", desc: "الغالب الذي خضعت له الرقاب وذلت له الجبابرة.", count: "ورد في القرآن 6 مرات." },
    { name: "الوهاب", desc: "كثير العطايا والهبات بلا عوض ولا غرض.", count: "ورد في القرآن 3 مرات." },
    { name: "الرزاق", desc: "المتكفل بأرزاق الخلائق جميعهم، قويهِم وضعيفِهم.", count: "ورد في القرآن مرة واحدة (بصيغة الرزاق)." },
    { name: "الفتاح", desc: "الذي يفتح خزائن رحمته لعباده، ويقضي بينهم بالحق والعدل.", count: "ورد في القرآن مرة واحدة." },
    { name: "العليم", desc: "الذي أحاط بكل شيء علمًا، فلا يخفى عليه شيء في الأرض ولا في السماء.", count: "ورد في القرآن 157 مرة." },
    { name: "القابض", desc: "الذي يمسك الرزق عمن يشاء من خلقه بحكمته.", count: "ورد في السنة (ثابت في القرآن بالمعنى)." },
    { name: "الباسط", desc: "الذي يوسع الرزق لمن يشاء بجوده وكرمه.", count: "ورد في السنة (ثابت في القرآن بالمعنى)." },
    { name: "الخافض", desc: "الذي يخفض الجبارين والمتكبرين ويذلهم.", count: "ثابت بالمعنى في القرآن والسنة." },
    { name: "الرافع", desc: "الذي يرفع أولياءه بالطاعات، ويرفع أقدار المؤمنين.", count: "ثابت بالمعنى في القرآن والسنة." },
    { name: "المعز", desc: "الذي يهب العزة لمن يشاء من عباده.", count: "ورد في القرآن بصيغة الفعل (تعز من تشاء)." },
    { name: "المذل", desc: "الذي يذل من يشاء من الكافرين والعصاة.", count: "ورد في القرآن بصيغة الفعل (تذل من تشاء)." },
    { name: "السميع", desc: "الذي يسمع كل الأصوات، السر والعلن عنده سواء.", count: "ورد في القرآن 45 مرة." },
    { name: "البصير", desc: "الذي يرى كل الأشياء، دقيقها وجليلها، لا يخفى عليه شيء.", count: "ورد في القرآن 42 مرة." },
    { name: "الحكم", desc: "الذي يفصل بين الخلائق بالعدل، ولا راد لقضائه.", count: "ورد في السنة (ثابت في القرآن بالمعنى)." },
    { name: "العدل", desc: "المنزه عن الظلم والجور في أفعاله وأحكامه.", count: "ثابت بالمعنى في القرآن والسنة." },
    { name: "اللطيف", desc: "البر بعباده، الذي يوصل إليهم مصالحهم بلطف ورفق من حيث لا يحتسبون.", count: "ورد في القرآن 7 مرات." },
    { name: "الخبير", desc: "العالم ببواطن الأمور وخفايا الصدور.", count: "ورد في القرآن 45 مرة." },
    { name: "الحليم", desc: "الذي لا يعجل بالعقوبة على عباده مع قدرته عليهم ليتوبوا.", count: "ورد في القرآن 11 مرة." },
    { name: "العظيم", desc: "المستحق لصفات الكبرياء والجلال، الذي لا تدركه العقول.", count: "ورد في القرآن 9 مرات." },
    { name: "الغفور", desc: "كثير الغفران والستر لذنوب عباده مهما عظمت.", count: "ورد في القرآن 91 مرة." },
    { name: "الشكور", desc: "الذي يعطي الجزيل من الثواب على القليل من العمل.", count: "ورد في القرآن 4 مرات." },
    { name: "العلي", desc: "صاحب العلو المطلق، الذي علا بذاته وقدره وقهره فوق كل شيء.", count: "ورد في القرآن 8 مرات." },
    { name: "الكبير", desc: "الذي لا أكبر منه، عظيم الشأن والكبرياء.", count: "ورد في القرآن 6 مرات." },
    { name: "الحفيظ", desc: "الذي يحفظ الخلائق ويدبر أمرهم، ويحفظ أعمال عباده.", count: "ورد في القرآن 3 مرات." },
    { name: "المقيت", desc: "المقتدر الذي يعطي كل مخلوق قوته (رزقه) الذي يقتات به.", count: "ورد في القرآن مرة واحدة." },
    { name: "الحسيب", desc: "الكافي لعباده، والمحاسب لهم على أعمالهم.", count: "ورد في القرآن 3 مرات." },
    { name: "الجليل", desc: "المتصف بصفات الجلال والكمال والعظمة.", count: "ثابت بالمعنى في القرآن والسنة." },
    { name: "الكريم", desc: "كثير الخير، الذي يعطي بلا سؤال، ويصفح عن الذنوب.", count: "ورد في القرآن 3 مرات." },
    { name: "الرقيب", desc: "الحافظ الذي لا يغيب عنه شيء، والمراقب لأعمال الخلائق.", count: "ورد في القرآن 3 مرات." },
    { name: "المجيب", desc: "الذي يقابل الدعاء والسؤال بالقضاء والعطاء.", count: "ورد في القرآن مرة واحدة." },
    { name: "الواسع", desc: "الذي وسع علمه ورحمته ورزقه كل شيء.", count: "ورد في القرآن 9 مرات." },
    { name: "الحكيم", desc: "الذي يضع الأشياء في مواضعها الصحيحة، صاحب الحكمة البالغة.", count: "ورد في القرآن 91 مرة." },
    { name: "الودود", desc: "الذي يحب أولياءه ويتحبب إلى عباده بالنعم والمغفرة.", count: "ورد في القرآن مرتان." },
    { name: "المجيد", desc: "الشريف الذات، عظيم الصفات، واسع الكرم والجود.", count: "ورد في القرآن مرتان." },
    { name: "الباعث", desc: "الذي يحيي الموتى ويبعثهم من قبورهم للحساب.", count: "ثابت بالمعنى في القرآن والسنة." },
    { name: "الشهيد", desc: "الذي لا يغيب عنه شيء، الحاضر المطلع على كل غيب وشهادة.", count: "ورد في القرآن 18 مرة." },
    { name: "الحق", desc: "الذي لا شك في وجوده ولا في ألوهيته، ووعده حق ولقاؤه حق.", count: "ورد في القرآن 10 مرات." },
    { name: "الوكيل", desc: "المتولي لأمور عباده، القائم بمصالحهم الكفيل بأرزاقهم.", count: "ورد في القرآن 13 مرة." },
    { name: "القوي", desc: "صاحب القدرة الكاملة التي لا يعتريها عجز أو وهن.", count: "ورد في القرآن 9 مرات." },
    { name: "المتين", desc: "شديد القوة، الذي لا تنقطع قوته ولا يلحقه تعب.", count: "ورد في القرآن مرة واحدة." },
    { name: "الولي", desc: "المحب والناصر والمؤيد لأوليائه المؤمنين.", count: "ورد في القرآن 15 مرة." },
    { name: "الحميد", desc: "المستحق لكل حمد وثناء بصفات كماله وأفعال جلاله.", count: "ورد في القرآن 17 مرة." },
    { name: "المحصي", desc: "الذي أحصى كل شيء بعلمه، فلا يفوته دقيق ولا جليل.", count: "ثابت بالمعنى في القرآن والسنة." },
    { name: "المبدئ", desc: "الذي بدأ خلق الأشياء وأوجدها من العدم.", count: "ورد في القرآن بصيغة الفعل (يبدئ الخلق)." },
    { name: "المعيد", desc: "الذي يعيد الخلق بعد موتهم وبعد فنائهم.", count: "ورد في القرآن بصيغة الفعل (يعيد)." },
    { name: "المحيي", desc: "الذي يحيي الأجسام بإيجاد الأرواح فيها.", count: "ورد في القرآن بصيغة الفعل (يحيي)." },
    { name: "المميت", desc: "الذي يكتب الموت على كل مخلوق.", count: "ورد في القرآن بصيغة الفعل (يميت)." },
    { name: "الحي", desc: "الذي له الحياة الكاملة الدائمة التي لا أول لها ولا آخر.", count: "ورد في القرآن 5 مرات." },
    { name: "القيوم", desc: "القائم بنفسه، الغني عن غيره، المقيم لكل موجودات الكون.", count: "ورد في القرآن 3 مرات." },
    { name: "الواجد", desc: "الذي لا يعوزه شيء، وكل ما يريده فهو موجود عنده.", count: "ثابت بالمعنى في القرآن والسنة." },
    { name: "الماجد", desc: "كثير العطاء والجود، عظيم الشأن والقدر.", count: "ثابت بالمعنى في القرآن والسنة." },
    { name: "الواحد", desc: "المنفرد في ذاته وصفاته وأفعاله، فلا شريك له.", count: "ورد في القرآن 22 مرة." },
    { name: "الأحد", desc: "المنفرد بالوحدانية، الذي لا يتجزأ ولا شبيه له.", count: "ورد في القرآن مرة واحدة (سورة الإخلاص)." },
    { name: "الصمد", desc: "الذي تصمد إليه الخلائق في حاجاتها، المستغني عن كل أحد.", count: "ورد في القرآن مرة واحدة." },
    { name: "القادر", desc: "الذي له القدرة الشاملة، فلا يعجزه شيء أراده.", count: "ورد في القرآن 7 مرات." },
    { name: "المقتدر", desc: "تام القدرة الذي لا يمتنع عليه شيء.", count: "ورد في القرآن 4 مرات." },
    { name: "المقدم", desc: "الذي يقدم الأشياء ويضعها في مواضعها بتقديره وحكمته.", count: "ورد في السنة النبوية." },
    { name: "المؤخر", desc: "الذي يؤخر الأشياء بتقديره وحكمته.", count: "ورد في السنة النبوية." },
    { name: "الأول", desc: "الذي ليس قبله شيء، الأزلي القديم.", count: "ورد في القرآن مرة واحدة." },
    { name: "الآخر", desc: "الذي ليس بعده شيء، الباقي بعد فناء خلقه.", count: "ورد في القرآن مرة واحدة." },
    { name: "الظاهر", desc: "الذي ظهر فوق كل شيء وعلا عليه، وظهرت أدلة وجوده.", count: "ورد في القرآن مرة واحدة." },
    { name: "الباطن", desc: "الذي بطن فلا يراه أحد في الدنيا، العالم بالسرائر.", count: "ورد في القرآن مرة واحدة." },
    { name: "الوالي", desc: "المالك للأشياء، المتصرف فيها بمشيئته وحكمته.", count: "ورد في القرآن مرة واحدة." },
    { name: "المتعالي", desc: "المتنزه عن صفات المخلوقين، العالي فوق كل شيء.", count: "ورد في القرآن مرة واحدة." },
    { name: "البر", desc: "كثير الإحسان والعطاء، الصادق في وعده.", count: "ورد في القرآن مرة واحدة." },
    { name: "التواب", desc: "الذي يوفق عباده للتوبة ويقبلها منهم مرة بعد مرة.", count: "ورد في القرآن 11 مرة." },
    { name: "المنتقم", desc: "الذي يقصم ظهور الجبابرة ويسلط العقوبة على العصاة.", count: "ورد في القرآن 3 مرات (بصيغة منتقمون)." },
    { name: "العفو", desc: "الذي يمحو الذنوب ويتجاوز عن السيئات.", count: "ورد في القرآن 5 مرات." },
    { name: "الرؤوف", desc: "شديد الرحمة، والرأفة هي أعلى معاني الرحمة.", count: "ورد في القرآن 10 مرات." },
    { name: "مالك الملك", desc: "المتصرف في ملكه كيف يشاء، لا راد لحكمه.", count: "ورد في القرآن مرة واحدة." },
    { name: "ذو الجلال والإكرام", desc: "المستحق للتمجيد والتعظيم، وصاحب السعة والجود.", count: "ورد في القرآن مرتان." },
    { name: "المقسط", desc: "العادل في حكمه، الذي ينصف المظلوم من الظالم.", count: "ثابت بالمعنى في القرآن والسنة." },
    { name: "الجامع", desc: "الذي يجمع الخلائق يوم القيامة، ويجمع بين المتماثلات والمتضادات.", count: "ورد في القرآن مرتان." },
    { name: "الغني", desc: "الذي لا يحتاج إلى أحد، والكل محتاج إليه.", count: "ورد في القرآن 18 مرة." },
    { name: "المغني", desc: "الذي يغني من يشاء من خلقه بجوده وكرمه.", count: "ورد في القرآن بصيغة الفعل (أغناهم الله)." },
    { name: "المانع", desc: "الذي يمنع العطاء عمن يشاء حماية له أو ابتلاء.", count: "ثابت بالسنة والمعنى." },
    { name: "الضار", desc: "المقدر للضر لمن يشاء من خلقه.", count: "ثابت بالمعنى (لا ضار ولا نافع إلا الله)." },
    { name: "النافع", desc: "المقدر للنفع لمن يشاء من عباده.", count: "ثابت بالمعنى في القرآن والسنة." },
    { name: "النور", desc: "الذي ينور السماوات والأرض، وهادي المؤمنين لنوره.", count: "ورد في القرآن مرة واحدة." },
    { name: "الهادي", desc: "الذي يهدى الخلائق لمصالحهم، ويهدي المؤمنين للحق.", count: "ورد في القرآن مرتان." },
    { name: "البديع", desc: "الذي خلق الكون في أبهى صورة بلا مثال سابق.", count: "ورد في القرآن مرتان." },
    { name: "الباقي", desc: "الذي لا يقبل الفناء، الدائم الوجود.", count: "ثابت بالمعنى (ويبقى وجه ربك)." },
    { name: "الوارث", desc: "الذي يبقى بعد فناء الخلق، وإليه مرجع كل شيء.", count: "ورد في القرآن 3 مرات." },
    { name: "الرشيد", desc: "الذي يرشد الخلق ويدبرهم بحكمته، وأفعاله سديدة.", count: "ثابت بالمعنى في القرآن والسنة." },
    { name: "الصبور", desc: "الذي لا يعاجل العصاة بالعقوبة، ويصبر على أذى العباد.", count: "ثابت بالسنة والمعنى." }
];


function initNamesGrid() {
    const grid = document.getElementById('names-grid');
    grid.innerHTML = namesData.map((item, index) => `
        <div class="name-card" onclick="showNameDetails(${index})" style="background:white; border:2px solid var(--gold); border-radius:15px; padding:20px; cursor:pointer; transition:0.3s; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            <h2 style="color:var(--dark-teal); margin:0;">${item.name}</h2>
        </div>
    `).join('');
}

function showNameDetails(index) {
    const item = namesData[index];
    document.getElementById('modal-name-title').innerText = item.name;
    document.getElementById('modal-name-desc').innerText = item.desc;
    document.getElementById('modal-name-count').innerText = item.count;
    document.getElementById('name-details-modal').style.display = 'flex';
}

function closeNameDetails() {
    document.getElementById('name-details-modal').style.display = 'none';
}
function switchMainTab(t) {
    // 1. تحديث شكل الأزرار (بشرط التأكد من وجود الزر أولاً عشان ما يعلق الكود)
    document.querySelectorAll('.main-nav button').forEach(b => b.classList.remove('active'));
    const activeBtn = document.getElementById(t + 'Tab');
    if (activeBtn) activeBtn.classList.add('active');

    // 2. قائمة الأقسام كما هي في الـ HTML عندك
    const sections = {
        'quran': 'quran-section',
        'azkar': 'azkar-section',
        'sebha': 'sebha-section',
        'prayer': 'prayer-section',
        'qibla': 'qibla-section',
        'khatma': 'khatma-section',
        'names': 'names-section'
    };

    // 3. إخفاء الكل وإظهار القسم المطلوب فقط
    Object.values(sections).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    const targetId = sections[t];
    const targetEl = document.getElementById(targetId);
    if (targetEl) {
        targetEl.style.display = 'block';
    }

    // 4. تشغيل الدوال الخاصة بكل قسم (فقط إذا كانت موجودة)
    if (t === 'quran' && typeof showMain === 'function') showMain();
    if (t === 'khatma' && typeof updateKhatmaUI === 'function') updateKhatmaUI();
    if (t === 'names' && typeof initNamesGrid === 'function') initNamesGrid();
    if (t === 'prayer' && typeof fetchPrayers === 'function') fetchPrayers();
    if (t === 'qibla' && typeof getQibla === 'function') getQibla();

    // 5. إغلاق المنيو الجانبية (Sidebar) لو كانت مفتوحة
    const sideMenu = document.getElementById('sideMenu');
    if (sideMenu && sideMenu.classList.contains('open')) {
        toggleMenu();
    }
}


// إغلاق المودال عند الضغط خارجه (لأسماء الله الحسنى)
window.onclick = function(event) {
    const modal = document.getElementById('name-details-modal');
    if (event.target == modal) {
        closeNameDetails();
    }
}
// دالة تسجيل الدخول والمزامنة
window.loginAndSync = async function() {
    try {
        // دالة تسجيل الدخول والمزامنة باستخدام التحويل (Redirect)
window.loginAndSync = function() {
    // هذه الطريقة لا يحجبها المتصفح لأنها تفتح في نفس الصفحة
    signInWithRedirect(auth, provider);
};

// هذا الكود يعمل تلقائياً عند العودة من صفحة جوجل للموقع
import { getRedirectResult } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

getRedirectResult(auth).then(async (result) => {
    if (result && result.user) {
        const user = result.user;
        const localData = localStorage.getItem('khatmaProgress');
        
        if (localData) {
            // رفع البيانات للسحاب
            await setDoc(doc(db, "users", user.uid), {
                khatma: JSON.parse(localData),
                displayName: user.displayName,
                lastSync: new Date()
            });
            alert("تمت المزامنة بنجاح يا " + user.displayName + " ✅");
        }
    }
}).catch((error) => {
    console.error("خطأ في المزامنة:", error);
});

};
window.requestSystemNotify = function() {
    if (!("Notification" in window)) {
        alert("متصفحك لا يدعم الإشعارات");
        return;
    }
    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            new Notification("حقيبة المؤمن", {
                body: "تم تفعيل التنبيهات بنجاح ✅ سنذكرك بالأوراد والصلوات.",
                icon: "favicon.ico" // تأكد من مسار أيقونة موقعك
            });
        }
    });
};

