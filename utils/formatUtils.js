export function convertToDatabaseFormat(str) {
    return str = str.trim().replace(/\s/g , "-").toLowerCase();
};

export function convertToDisplayFormat(str) {
    return toTitleCase(str.replaceAll("-", " "));
};

export function removeExcessWhiteSpace(str) {
    return str.replace(/\s{2,}/g,' ').trim();
};

export function toTitleCase(str) {
    return removeExcessWhiteSpace(str.replace(
        /\w\S*/g,
        text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    ));
};