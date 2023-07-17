function getRandomIntInclusive(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}

export function genreToBPM(genre: string) {
    switch (genre.toLowerCase()) {
        case 'alternative':
            return getRandomIntInclusive(115, 130);
        case 'downtempo':
            return getRandomIntInclusive(70, 100);
        case 'jazz':
            return getRandomIntInclusive(112, 125);
        case 'hip-hop/rap':
            return getRandomIntInclusive(85, 115);
        case 'funk':
            return getRandomIntInclusive(120, 125);
        case 'pop':
            return getRandomIntInclusive(100, 130);
        case 'r&b/soul':
            return getRandomIntInclusive(60, 80);
        case 'reggae':
            return getRandomIntInclusive(60, 90);
        case 'indie rock':
        case 'rock':
            return getRandomIntInclusive(110, 140);
        case 'metal':
        case 'heavy metal':
            return getRandomIntInclusive(100, 160);
        case 'house':
            return getRandomIntInclusive(118, 135);
        case 'trance':
            return getRandomIntInclusive(130, 145);
        case 'garage':
            return getRandomIntInclusive(130, 135);
        case 'jungle':
            return getRandomIntInclusive(155, 180);
        case 'drum & bass':
            return getRandomIntInclusive(165, 185);
        case 'soundtrack':
            return getRandomIntInclusive(80, 125);
        case 'blues':
            return getRandomIntInclusive(100, 120);
        case 'electronic':
            return getRandomIntInclusive(120, 135);
        case 'folk':
            return getRandomIntInclusive(90, 120);
        case 'classical':
            return getRandomIntInclusive(108, 162);
        default:
            return 140;
    }
}

/**
* Shuffles array in place.
*/
export function shuffle(a: []) {
    const copy = [...a];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}