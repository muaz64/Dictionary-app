const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const reloadButton = document.getElementById('reloadButton');
const resultContainer = document.getElementById('result-container');
const wordTitle = document.getElementById('wordTitle');
const wordDescription = document.getElementById('wordDescription');
const banglaDescription = document.getElementById('banglaDescription');
const audioButton = document.getElementById('audioButton');

searchButton.addEventListener("click", () => {
    search();
});

searchInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
        search();
    }
});

reloadButton.addEventListener("click", () => {
    reload();
});

function search() {
    const searchTerm = searchInput.value.trim();
    if (searchTerm === '') {
        alert('Please enter a word to search.');
        return;
    }
    fetchDictionaryData(searchTerm);
}

async function fetchDictionaryData(searchTerm) {
    setLoading(true);
    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${searchTerm}`);
        if (!response.ok) {
            if (response.status === 404) {
                showError('Word not found.');
            } else {
                throw new Error('Failed to fetch the data');
            }
        } else {
            const data = await response.json();
            displayResult(data);
            fetchBanglaTranslation(searchTerm);
        }
    } catch (error) {
        console.log(error);
        showError('An error occurred while fetching the data.');
    } finally {
        setLoading(false);
    }
}

async function fetchBanglaTranslation(searchTerm) {
    try {
        const response = await fetch(`https://libretranslate.com/translate/${searchTerm}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                q: searchTerm,
                source: 'en',
                target: 'bn'
            })
        });
        if (!response.ok) {
            throw new Error('Failed to fetch the translation');
        }
        const data = await response.json();
        displayBanglaTranslation(data.translatedText);
    } catch (error) {
        console.log(error);
        banglaDescription.textContent = 'Failed to fetch Bangla meaning';
    }
}

function displayResult(data) {
    resultContainer.style.display = 'block';
    const wordData = data[0];
    wordTitle.textContent = wordData.word;
    wordDescription.innerHTML = `
       <ul> 
        ${wordData.meanings.map(meaning => `
            <li>
                <p><strong>Part of Speech: </strong> ${meaning.partOfSpeech}</p>
                <p><strong>Definition: </strong> ${meaning.definitions[0].definition}</p>
            </li>
        `).join('')}
       </ul>
    `;
}

function displayBanglaTranslation(translation) {
    banglaDescription.textContent = `Bangla: ${translation}`;
}

function showError(message) {
    wordTitle.textContent = 'Error';
    wordDescription.textContent = message;
    banglaDescription.textContent = '';
    resultContainer.style.display = 'block';
}

function setLoading(isLoading) {
    const loading = document.getElementById('loading');
    if (isLoading) {
        loading.style.display = 'block';
        resultContainer.style.display = 'none';
    } else {
        loading.style.display = 'none';
    }
}

function reload() {
    searchInput.value = '';
    resultContainer.style.display = 'none';
    wordTitle.textContent = 'Content';
    wordDescription.textContent = 'Content';
    banglaDescription.textContent = 'Bangla Meaning';
    setLoading(false);
}

audioButton.addEventListener("click", () => {
    const searchTerm = searchInput.value.trim();
    if (searchTerm === '') {
        alert('Please enter a word to search.');
        return;
    }
    speak(searchTerm);
});

function speak(word) {
    const speech = new SpeechSynthesisUtterance(word);
    speech.lang = 'en-US';
    speech.volume = 2;
    speech.rate = 1;
    speech.pitch = 1;
    window.speechSynthesis.speak(speech);
}
