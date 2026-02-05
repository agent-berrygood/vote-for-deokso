/**
 * Converts a Google Drive sharing URL to a direct image URL.
 * Works for 'drive.google.com/file/d/ID/view' and 'drive.google.com/open?id=ID' formats.
 * Returns the original URL if no ID is found.
 */
export const getDriveImageUrl = (url: string): string => {
    if (!url) return '';

    // Extract ID using Regex
    // Matches /d/ID or id=ID
    const idRegex = /[-\w]{25,}/;
    const match = url.match(idRegex);

    if (match && match[0]) {
        return `https://lh3.googleusercontent.com/d/${match[0]}`;
    }

    return url;
};
