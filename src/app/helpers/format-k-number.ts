/**
 * Format a number into K format
 * 
 * Example 1: 1200 => "1K2"
 * 
 * Example 2: 143940 => "143K"
 * 
 * Example 3: 375 => "375"
 * 
 * @param n number
 */
export function formatKNumber(n: number, maxLength = 4) {
    const thousand = Math.floor(n / 1000)

    if (thousand === 0) return n;

    const thousandStr = `${thousand}`
    const floating = (`${roundDecimal(n / 1000)}`.split('.', 2)[1]) ?? ''
    const concat = thousandStr + 'K' + floating

    return concat.length <= maxLength ? concat : (thousandStr + 'K').padEnd(maxLength, floating)
}

function roundDecimal(n: number, decimalPlace = 1) {
    const factor = 10 ** decimalPlace
    return Math.round(n * factor) / factor
}