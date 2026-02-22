const UI = {
    surahNumber: document.getElementById('surahNumber'),
    btnLoadSurah: document.getElementById('btnLoadSurah'),
    loader: document.getElementById('loader'),
    modeSelection: document.getElementById('modeSelection'),
    surahTitle: document.getElementById('surahTitle'),
    surahDesc: document.getElementById('surahDesc'),
    modeBtns: document.querySelectorAll('.mode-buttons .btn-card'),
    workspace: document.getElementById('workspace'),
    audioPlayer: document.getElementById('audioPlayer'),
    prepLayoutSelect: document.getElementById('prepLayoutSelect'),
    prepParams: document.getElementById('prepParams'),
    interactiveOrderSelect: document.getElementById('interactiveOrderSelect')
};

let currentSurahData = null;
let currentMode = '';
let currentVerseIndex = 0;
let currentState = 0; // Tracks the step in interactive modes
let interactiveAyahs = []; // Holds the ordered/randomized ayahs for interactive mode

// Icons
const playIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;

// Helpers
function getFirstChunk(arabText) {
    const tokens = arabText.trim().split(/\s+/);
    return tokens[0];
}

function playAudio(url) {
    UI.audioPlayer.pause();
    UI.audioPlayer.src = url;
    UI.audioPlayer.play();
}

function stopAudio() {
    UI.audioPlayer.pause();
    UI.audioPlayer.currentTime = 0;
}

// 1. Load Surah
UI.btnLoadSurah.addEventListener('click', async () => {
    let no = parseInt(UI.surahNumber.value);

    if (isNaN(no)) {
        no = 78; // Default An-Naba if empty
        UI.surahNumber.value = 78;
    }

    if (no < 1 || no > 114) {
        alert("Pilih nomor surah antara 1 hingga 114");
        return;
    }

    // Prepare UI
    UI.loader.classList.remove('hidden');
    UI.modeSelection.classList.add('hidden');
    UI.workspace.classList.add('hidden');

    try {
        const res = await fetch(`https://equran.id/api/v2/surat/${no}`);
        if (!res.ok) throw new Error("Gagal mengambil data dari API.");

        const json = await res.json();
        currentSurahData = json.data;

        // Update titles
        UI.surahTitle.textContent = `${currentSurahData.nomor}. Surah ${currentSurahData.namaLatin} (${currentSurahData.nama})`;
        UI.surahDesc.textContent = `${currentSurahData.arti} • ${currentSurahData.jumlahAyat} Ayat`;

        UI.loader.classList.add('hidden');
        UI.modeSelection.classList.remove('hidden');
    } catch (err) {
        alert(err.message);
        UI.loader.classList.add('hidden');
    }
});

// 2. Select Mode Options & Handlers
UI.prepLayoutSelect.addEventListener('change', () => {
    const val = UI.prepLayoutSelect.value;
    const params = UI.prepParams;
    params.innerHTML = '';

    if (val === 'default') {
        params.classList.add('hidden');
    } else {
        params.classList.remove('hidden');
        if (val === 'perX') {
            params.innerHTML = `
                <label>Jumlah Ayat per Tabel:</label>
                <input type="number" id="paramPerX" value="5" min="1" max="100"/>
            `;
        } else if (val === 'splitLR') {
            params.innerHTML = `
                <label>Batas Akhir Kolom Kiri:</label>
                <input type="number" id="paramSplit" value="15" min="1" max="100"/>
                <small style="color:var(--text-muted)">*Sisanya masuk kolom Makanan</small>
            `;
        } else if (val === 'focusCenter') {
            params.innerHTML = `
                <label>Ayat Fokus (Tengah):</label>
                <input type="number" id="paramCenter" value="15" min="1" max="100"/>
                <small style="color:var(--text-muted)">*Atas: 1 s.d [Fokus-1], Bawah: [Fokus+1] s.d Akhir</small>
            `;
        } else if (val === 'quadrants') {
            params.innerHTML = `
                <label>Batas Kuadran 1 (Kiri Atas):</label>
                <input type="number" id="paramQ1" value="10" min="1" max="100"/>
                <label>Batas Kuadran 2 (Kanan Atas):</label>
                <input type="number" id="paramQ2" value="20" min="1" max="100"/>
                <label>Batas Kuadran 3 (Kiri Bawah):</label>
                <input type="number" id="paramQ3" value="30" min="1" max="100"/>
            `;
        }
    }
});

UI.modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        currentMode = btn.getAttribute('data-mode');
        UI.modeSelection.classList.add('hidden');
        startMode();
    });
});

function backToModes() {
    stopAudio();
    UI.workspace.classList.add('hidden');
    UI.modeSelection.classList.remove('hidden');
}

function startMode() {
    currentVerseIndex = 0;
    currentState = 0;

    // Prepare the interactive array based on the selected order
    let order = UI.interactiveOrderSelect.value; // sequential, random, reverse
    let baseArray = [...currentSurahData.ayat];

    if (order === 'reverse') {
        baseArray.reverse();
    } else if (order === 'random') {
        // Fisher-Yates shuffle
        for (let i = baseArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [baseArray[i], baseArray[j]] = [baseArray[j], baseArray[i]];
        }
    }
    interactiveAyahs = baseArray;

    renderWorkspace();
}

// 3. Render functions
function renderWorkspace() {
    UI.workspace.innerHTML = '';
    UI.workspace.classList.remove('hidden');

    // Make Top Bar
    const topBar = document.createElement('div');
    topBar.className = 'top-bar fade-in';

    let modeText = "";
    if (currentMode === 'persiapan') modeText = "Modus: Persiapan";
    if (currentMode === 'potongan') modeText = "Modus: Potongan Awal";
    if (currentMode === 'angka') modeText = "Modus: Angka Dulu";

    topBar.innerHTML = `
        <button class="btn-back" onclick="backToModes()">← Kembali</button>
        <div style="font-weight: 600; color: var(--accent);">${modeText}</div>
    `;
    UI.workspace.appendChild(topBar);

    if (currentMode === 'persiapan') {
        renderPersiapan();
    } else {
        renderInteractive();
    }
}

function renderPersiapan() {
    const layout = UI.prepLayoutSelect.value;
    const container = document.createElement('div');
    container.className = 'persiapan-wrapper fade-in';

    let html = '';
    const ayahs = currentSurahData.ayat;

    // Helper functions for layout generation
    const renderAyatRow = (ayat) => {
        return `
            <div class="glass-card ayat-row" id="row-${ayat.nomorAyat}">
                <div class="ayat-num">${ayat.nomorAyat}</div>
                <div class="arab-text" id="text-${ayat.nomorAyat}">${getFirstChunk(ayat.teksArab)} ...</div>
                <div class="row-controls">
                    <button class="btn-play-sm" onclick="playAudio('${ayat.audio['06']}')">${playIcon}</button>
                    <button class="btn-show-full" onclick="toggleAyatFull(${ayat.nomorAyat})">Tampilkan Penuh</button>
                </div>
            </div>
        `;
    };

    const renderGroup = (title, idPrefix, ayahsSubset) => {
        if (ayahsSubset.length === 0) return '';
        let groupHtml = `
            <div class="box-group" id="${idPrefix}">
                <div class="group-header">
                    <span>${title} (${ayahsSubset.length} Ayat)</span>
                    <button class="btn-toggle-group" onclick="toggleGroup('${idPrefix}')">👁️</button>
                </div>
                <div class="group-content">
                    ${ayahsSubset.map(renderAyatRow).join('')}
                </div>
            </div>
        `;
        return groupHtml;
    };

    if (layout === 'default') {
        container.innerHTML = `<div class="layout-list">${ayahs.map(renderAyatRow).join('')}</div>`;
    }
    else if (layout === 'perX') {
        const per = parseInt(document.getElementById('paramPerX').value) || 5;
        let gridHtml = '<div class="layout-perX">';
        for (let i = 0; i < ayahs.length; i += per) {
            const chunk = ayahs.slice(i, i + per);
            gridHtml += renderGroup(`Ayat ${chunk[0].nomorAyat} - ${chunk[chunk.length - 1].nomorAyat}`, `group-v-${i}`, chunk);
        }
        gridHtml += '</div>';
        container.innerHTML = gridHtml;
    }
    else if (layout === 'splitLR') {
        const splitIndex = parseInt(document.getElementById('paramSplit').value) || 15;
        const leftArr = ayahs.slice(0, splitIndex);
        const rightArr = ayahs.slice(splitIndex);

        let gridHtml = `
            <div class="layout-splitLR">
                ${renderGroup('Kolom Kiri', 'group-left', leftArr)}
                ${renderGroup('Kolom Kanan', 'group-right', rightArr)}
            </div>
        `;
        container.innerHTML = gridHtml;
    }
    else if (layout === 'focusCenter') {
        const centerIndex = parseInt(document.getElementById('paramCenter').value) || 15;
        const topArr = ayahs.slice(0, centerIndex - 1);
        const centerAyat = ayahs.find(a => a.nomorAyat === centerIndex);
        const botArr = ayahs.slice(centerIndex);

        let gridHtml = `<div class="layout-focusCenter">`;
        if (topArr.length) gridHtml += renderGroup('Bagian Atas', 'group-top', topArr);
        if (centerAyat) {
            gridHtml += `
                <div class="center-focus-area">
                    <h3 class="text-center mb-4" style="color:var(--accent)">Fokus Utama</h3>
                    <div style="max-width: 600px; margin: 0 auto;">
                        ${renderAyatRow(centerAyat)}
                    </div>
                </div>
            `;
        }
        if (botArr.length) gridHtml += renderGroup('Bagian Bawah', 'group-bot', botArr);
        gridHtml += `</div>`;
        container.innerHTML = gridHtml;
    }
    else if (layout === 'quadrants') {
        const q1 = parseInt(document.getElementById('paramQ1').value) || 10;
        const q2 = parseInt(document.getElementById('paramQ2').value) || 20;
        const q3 = parseInt(document.getElementById('paramQ3').value) || 30;

        const arrQ1 = ayahs.slice(0, q1);
        const arrQ2 = ayahs.slice(q1, q2);
        const arrQ3 = ayahs.slice(q2, q3);
        const arrQ4 = ayahs.slice(q3);

        let gridHtml = `
            <div class="layout-quadrants">
                ${renderGroup('Kuadran 1 (Kiri Atas)', 'group-q1', arrQ1)}
                ${renderGroup('Kuadran 2 (Kanan Atas)', 'group-q2', arrQ2)}
                ${renderGroup('Kuadran 3 (Kiri Bawah)', 'group-q3', arrQ3)}
                ${renderGroup('Kuadran 4 (Kanan Bawah)', 'group-q4', arrQ4)}
            </div>
        `;
        container.innerHTML = gridHtml;
    }

    UI.workspace.appendChild(container);
}

// Global functions for inline HTML element onclick
window.toggleGroup = function (groupId) {
    const group = document.getElementById(groupId);
    if (group) {
        const content = group.querySelector('.group-content');
        if (content.classList.contains('hidden')) {
            content.classList.remove('hidden');
        } else {
            content.classList.add('hidden');
        }
    }
};

window.toggleAyatFull = function (nomor) {
    const textEl = document.getElementById(`text-${nomor}`);
    const ayat = currentSurahData.ayat.find(a => a.nomorAyat === nomor);
    if (!textEl || !ayat) return;

    // Check if currently showing full text
    if (textEl.textContent.includes('...')) {
        textEl.textContent = ayat.teksArab;
    } else {
        textEl.textContent = getFirstChunk(ayat.teksArab) + ' ...';
    }
};

function renderInteractive() {
    // Check if finished
    if (currentVerseIndex >= interactiveAyahs.length) {
        const cardFinished = document.createElement('div');
        cardFinished.className = 'glass-panel play-card fade-in';
        cardFinished.innerHTML = `
            <div class="huge-num active" style="font-size:4rem; margin-bottom:2rem;">Alhamdulillah</div>
            <p class="subtitle">Selesai latihan surah ini.</p>
            <button class="btn btn-primary mt-8" onclick="backToModes()">Kembali ke Menu Utama</button>
        `;
        UI.workspace.appendChild(cardFinished);
        return;
    }

    const ayat = interactiveAyahs[currentVerseIndex];
    let html = '';
    let btnText = '';

    const orderInfo = `<div style="position:absolute; top:1rem; right:1rem; font-size:0.8rem; color:var(--text-muted); background:rgba(255,255,255,0.1); padding:0.3rem 0.6rem; border-radius:4px;">
        Progres: ${currentVerseIndex + 1} / ${interactiveAyahs.length}
    </div>`;

    if (currentMode === 'potongan') {
        if (currentState === 0) {
            html += orderInfo;
            html += `<div class="main-arab fade-in">${getFirstChunk(ayat.teksArab)}...</div>`;
            html += `<p class="subtitle fade-in">Tebak kelanjutan lafazh di atas</p>`;
            btnText = 'Tampilkan Ayat';
        } else {
            html += orderInfo;
            html += `<div class="huge-num fade-in" style="font-size:4rem;">Ayat ${ayat.nomorAyat}</div>`;
            html += `<div class="main-arab fade-in">${ayat.teksArab}</div>`;
            html += `<p class="subtitle fade-in" style="margin-bottom:1rem;">${ayat.teksIndonesia}</p>`;
            btnText = 'Selanjutnya →';
        }
    } else if (currentMode === 'angka') {
        if (currentState === 0) {
            html += orderInfo;
            html += `<div class="huge-num active fade-in">${ayat.nomorAyat}</div>`;
            html += `<p class="subtitle fade-in mt-8">Tebak awalan ayat ke-${ayat.nomorAyat}</p>`;
            btnText = 'Cek Awalan';
        } else if (currentState === 1) {
            html += orderInfo;
            html += `<div class="huge-num fade-in" style="font-size:3rem; margin-bottom:1rem;">Ayat ${ayat.nomorAyat}</div>`;
            html += `<div class="main-arab fade-in">${getFirstChunk(ayat.teksArab)}...</div>`;
            html += `<p class="subtitle fade-in">Lanjutkan!</p>`;
            btnText = 'Tampilkan Penuh';
        } else {
            html += orderInfo;
            html += `<div class="huge-num fade-in" style="font-size:3rem; margin-bottom:1rem;">Ayat ${ayat.nomorAyat}</div>`;
            html += `<div class="main-arab fade-in">${ayat.teksArab}</div>`;
            html += `<p class="subtitle fade-in" style="margin-bottom:1rem;">${ayat.teksIndonesia}</p>`;
            btnText = 'Selanjutnya →';
        }
    }

    const card = document.createElement('div');
    card.className = 'glass-panel play-card';
    card.innerHTML = html;

    const controls = document.createElement('div');
    controls.className = 'player-controls fade-in';

    const playBtn = document.createElement('button');
    playBtn.className = 'btn-play-main';
    playBtn.innerHTML = playIcon;
    playBtn.onclick = () => {
        if (ayat.audio['06']) playAudio(ayat.audio['06']);
    };

    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn btn-primary btn-proceed';
    nextBtn.innerHTML = btnText;
    nextBtn.onclick = nextState;

    controls.appendChild(playBtn);
    controls.appendChild(nextBtn);
    card.appendChild(controls);

    UI.workspace.appendChild(card);
}

function nextState() {
    stopAudio();
    if (currentMode === 'potongan') {
        if (currentState === 0) {
            currentState = 1;
        } else {
            currentState = 0;
            currentVerseIndex++;
        }
    } else if (currentMode === 'angka') {
        if (currentState === 0) {
            currentState = 1;
        } else if (currentState === 1) {
            currentState = 2;
        } else {
            currentState = 0;
            currentVerseIndex++;
        }
    }
    renderWorkspace();
}
