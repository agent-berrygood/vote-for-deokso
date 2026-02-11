/**
 * Hangul Initial Consonant Extractor
 * Extracts the Cho-sung (Initial) from a Korean character.
 */

const HANGUL_START = 44032; // '가'
const HANGUL_END = 55203;   // '힣'
const CHO_SUNG_LIST = [
    'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

// Map complex consonants to standard ones for flexible grouping
const CONSONANT_MAP: { [key: string]: string } = {
    'ㄲ': 'ㄱ',
    'ㄸ': 'ㄷ',
    'ㅃ': 'ㅂ',
    'ㅆ': 'ㅅ',
    'ㅉ': 'ㅈ'
};

/**
 * Returns the initial consonant of the first character of the given string.
 * If the first character is not Hangul, returns 'ETC'.
 */
export const getHangulInitial = (str: string): string => {
    if (!str) return 'ETC';

    const charCode = str.charCodeAt(0);

    // Check if it's a Hangul Syllable
    if (charCode >= HANGUL_START && charCode <= HANGUL_END) {
        const uniIndex = charCode - HANGUL_START;
        const choIndex = Math.floor(uniIndex / 588); // 588 = 21 * 28
        const initial = CHO_SUNG_LIST[choIndex];

        // Return mapped consonant (e.g., ㄲ -> ㄱ) or original
        return CONSONANT_MAP[initial] || initial;
    }

    // Check if it's already a Jamo (consonant)
    // Basic Jamo range: 0x3131 (12593) - 0x314E (12622) for modern consonants
    // We can assume if the string matches one of our list, it is one.
    if (CHO_SUNG_LIST.includes(str[0])) {
        return CONSONANT_MAP[str[0]] || str[0];
    }

    return 'ETC'; // Non-Hangul
};

export const ALPHABET_TABS = ['ALL', 'ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
