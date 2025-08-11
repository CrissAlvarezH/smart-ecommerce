// Utility functions for text normalization and comparison

/**
 * Fix double UTF-8 encoding issues common in databases
 */
function fixDoubleEncoding(text: string): string {
  try {
    // Common double-encoded UTF-8 patterns for Colombian text
    const fixes = {
      'Ã¡': 'á', 'Ã ': 'à', 'Ã¢': 'â', 'Ã£': 'ã', 'Ã¤': 'ä', 'Ã¥': 'å',
      'Ã©': 'é', 'Ã¨': 'è', 'Ãª': 'ê', 'Ã«': 'ë',
      'Ã­': 'í', 'Ã¬': 'ì', 'Ã®': 'î', 'Ã¯': 'ï',
      'Ã³': 'ó', 'Ã²': 'ò', 'Ã´': 'ô', 'Ãµ': 'õ', 'Ã¶': 'ö',
      'Ãº': 'ú', 'Ã¹': 'ù', 'Ã»': 'û', 'Ã¼': 'ü',
      'Ã±': 'ñ', 'Ã§': 'ç',
      'Ã‰': 'É', 'Ã': 'Á', 'Ã"': 'Ó', 'Ãš': 'Ú'
    };
    
    let fixed = text;
    for (const [encoded, decoded] of Object.entries(fixes)) {
      fixed = fixed.replace(new RegExp(encoded, 'g'), decoded);
    }
    return fixed;
  } catch (error) {
    console.warn('Error fixing double encoding:', error);
    return text;
  }
}

/**
 * Normalize text for comparison by handling encoding issues and accents
 */
export function normalizeForComparison(text: string): string {
  if (!text) return '';
  
  // First fix double encoding, then normalize
  const fixed = fixDoubleEncoding(text);
  
  // Remove accents and normalize to lowercase for comparison
  return fixed
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics/accents
    .toLowerCase()
    .trim();
}

/**
 * Check if two strings match after normalization
 */
export function normalizedEquals(str1: string, str2: string): boolean {
  return normalizeForComparison(str1) === normalizeForComparison(str2);
}

/**
 * Find matching item in array using normalized comparison
 */
export function findNormalizedMatch(searchItem: string, arrayToSearch: string[]): boolean {
  const normalizedSearch = normalizeForComparison(searchItem);
  return arrayToSearch.some(item => normalizeForComparison(item) === normalizedSearch);
}