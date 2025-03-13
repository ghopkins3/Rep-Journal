export function convertToDatabaseFormat(str) {
    return str = str.trim().replace(/\s/g , "-").toLowerCase();
}