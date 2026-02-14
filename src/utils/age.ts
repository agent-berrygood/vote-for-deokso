/**
 * Calculates age from birthdate string.
 * Supports various formats: 'YYYYMMDD', 'YYYY-MM-DD', 'YYMMDD'.
 * Returns legacyAge if birthdate is invalid or missing.
 */
export const calculateAge = (birthdate?: string, legacyAge?: number): number => {
    if (!birthdate) return legacyAge || 0;

    const today = new Date();
    let birthYear = 0;
    let birthMonth = 0;
    let birthDay = 0;

    // Remove non-digit characters to standardize
    const cleanDate = birthdate.replace(/[^0-9]/g, '');

    if (cleanDate.length === 8) {
        // YYYYMMDD
        birthYear = parseInt(cleanDate.substring(0, 4));
        birthMonth = parseInt(cleanDate.substring(4, 6));
        birthDay = parseInt(cleanDate.substring(6, 8));
    } else if (cleanDate.length === 6) {
        // YYMMDD (Assume 1900s for > 25, 2000s for <= 25? Or just 1900s for candidates?)
        // Let's assume 1900s if > 30, else 2000s (Context: Church Elders are usually older)
        // Actually, standardized to 19xx for most church positions usually.
        // Let's use a pivot. if year > currentYear % 100, it's 19xx.
        const yy = parseInt(cleanDate.substring(0, 2));
        const currentYY = today.getFullYear() % 100;
        const prefix = yy > currentYY ? 1900 : 2000;
        birthYear = prefix + yy;
        birthMonth = parseInt(cleanDate.substring(2, 4));
        birthDay = parseInt(cleanDate.substring(4, 6));
    } else {
        // Invalid or YYYY-MM-DD that wasn't cleaned properly? 
        // Logic for '-' handles by replace above.
        // If string is YYYY, maybe?
        if (cleanDate.length === 4) {
            birthYear = parseInt(cleanDate);
            birthMonth = 1;
            birthDay = 1;
        } else {
            return legacyAge || 0;
        }
    }

    let age = today.getFullYear() - birthYear;

    // Check if birthday has passed this year? 
    // Usually calculating "Korean Age" or "International Age"?
    // Voting usually follows International Age (Man-nai).
    // Let's stick to International Age.
    const m = today.getMonth() + 1 - birthMonth;
    if (m < 0 || (m === 0 && today.getDate() < birthDay)) {
        age--;
    }

    return age;
};
