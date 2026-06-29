const fs = require('fs');
const path = require('path');

async function downloadWordList() {
    const res = await fetch('https://raw.githubusercontent.com/first20hours/google-10000-english/master/20k.txt');
    const text = await res.text();
    const words = text.split('\n').filter(Boolean);
    fs.writeFileSync(path.join(__dirname, 'data/raw-words.json'), JSON.stringify(words, null, 2));
}

async function downloadEnableList() {
    const res = await fetch('https://raw.githubusercontent.com/dolph/dictionary/master/enable1.txt');
    const text = await res.text();
    const words = text.split('\n').filter(Boolean);
    fs.writeFileSync(path.join(__dirname, 'data/enable-words.json'), JSON.stringify(words, null, 2));
}

async function downloadSCOWLList() {
    const text = fs.readFileSync(path.join(__dirname, 'data/scowl_list.txt'), 'utf-8');
    const words = text.split('\n')
        .filter(w => w === w.toLowerCase())  // drops header, abbreviations, proper nouns
        .filter(w => /^[a-z]+$/.test(w))     // drops possessives and anything non-alpha
        .filter(w => w.length >= 4)
    fs.writeFileSync(path.join(__dirname, 'data/scowl-words.json'), JSON.stringify(words, null, 2));
}

async function filterWordList() {
    const res = await fetch('https://raw.githubusercontent.com/coffee-and-fun/google-profanity-words/main/data/en.txt')
    const text = await res.text()
    const badWords = new Set(text.split('\n').map(w => w.toLowerCase().trim()))

    
    const raw = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/raw-words.json'), 'utf-8'));
    const enable = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/enable-words.json'), 'utf-8'))
    const scowl = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/scowl-words.json'), 'utf-8'))
    const enableFiltered = enable.filter(w => w.length >= 4)
    const filtered = raw
        .filter(w => w.length >= 4)

    const inflectionsAdded = []

    filtered.forEach(function (word) {
        let inflections = [
            word,
            word + 's',
            word + 'er',
            word + 'ers',
            word + 'ing',
            word + 'ed',
            word + 'd',
            word + 'ly',
            word + 'st',
            word + 'est',
            word + 'ness',
            word + 'ly'
        ]

        inflectionsAdded.push(...inflections)
    })
    const uniqueInflections = [...new Set(inflectionsAdded)]
    const crossChecked = scowl.filter(w => enable.includes(w))
    const cleaned = crossChecked.filter(w => !badWords.has(w))
    fs.writeFileSync(path.join(__dirname, 'data/master-words.json'), JSON.stringify(cleaned, null, 2))
}

function letterSet(word) {
    return [...new Set(word)].sort().join('')
}

async function generatePangrams() {
    const pangrams = []
    const crossChecked = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/master-words.json'), 'utf-8'))
    for (let i = 0; i < crossChecked.length; i++) {
        let word = crossChecked[i].split('')
        let uniqueLetters = new Set(word)
        if (uniqueLetters.size === 7) {
            pangrams.push(crossChecked[i])
        }
    }

    const letterPools = {}

    for (const word of pangrams) {
        const key = letterSet(word)

        if (!letterPools[key]) {
            letterPools[key] = { pangrams: [] };
        }
        letterPools[key].pangrams.push(word)
    }

    console.log('puzzleCount', Object.keys(letterPools).length)

    Object.keys(letterPools).forEach(function (key) {
        let allowedLetters = new Set(key)
        let puzzleWordPool = []
        for (word of crossChecked) {
            if ([...word].every(character => allowedLetters.has(character))) {
                puzzleWordPool.push(word)
            }
        }
        letterPools[key].fullPool = puzzleWordPool

        let frequency = {}
        letterPools[key].fullPool.forEach(function (word) {
            let uniqueInWord = new Set(word)
            for (let char of [...uniqueInWord]) {
                if (!frequency[char]) {
                    frequency[char] = 0
                }

                frequency[char]++
            }
        })

        Object.keys(frequency).forEach(function (countKey) {
            frequency[countKey] = parseFloat(((frequency[countKey] / letterPools[key].fullPool.length) * 100).toFixed(1))
        })

        letterPools[key].letterFrequency = frequency

        //find frequency closest to 60%
        let closest = 100
        function findDifference(frequency) {
            let difference = 60 - frequency
            if (difference < 0) {
                return -difference
            }
            return difference
        }


        let frequencyArray = []

        Object.keys(letterPools[key].letterFrequency).forEach(function (letter) {
            frequencyArray.push(letterPools[key].letterFrequency[letter])
        })

        for (const freq of frequencyArray) {
            let difference = findDifference(freq)
            if (difference <= closest) {
                closest = difference
                letterPools[key].centerLetter = Object.keys(letterPools[key].letterFrequency).find(letter => letterPools[key].letterFrequency[letter] === freq)
            }
        }

        letterPools[key].finalPool = letterPools[key].fullPool.filter(w => w.includes(letterPools[key].centerLetter))

    })



    //create empty object to hashmap frequncy
    //go through each word in fullPool, create set, turn set to array, loop through array, if letter doesnt exist, add it, add one to frequency

    fs.writeFileSync(path.join(__dirname, 'data/pangram-list.json'), JSON.stringify(pangrams, null, 2))
    fs.writeFileSync(path.join(__dirname, 'data/puzzle-list.json'), JSON.stringify(letterPools, null, 2))
}

async function writeFinalPuzzlePool() {
    const rawPuzzlePool = await JSON.parse(fs.readFileSync(path.join(__dirname, 'data/puzzle-list.json'), 'utf-8'))

    let filteredPuzzlePool = {}

    for (const puzzle of Object.keys(rawPuzzlePool)) {
        if (rawPuzzlePool[puzzle].finalPool.length >= 30) {
            filteredPuzzlePool[puzzle] = rawPuzzlePool[puzzle]
        }
    }

    console.log('finalPuzzleList', Object.keys(filteredPuzzlePool).length)

    fs.writeFileSync(path.join(__dirname, 'data/final-puzzle-list.json'), JSON.stringify(filteredPuzzlePool, null, 2))
}


async function main() {
    await downloadWordList();
    await downloadEnableList();
    await downloadSCOWLList();
    await filterWordList();
    await generatePangrams();
    await writeFinalPuzzlePool();
}

main();
