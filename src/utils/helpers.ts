// convert text to title case
export function titleCase(str: string): string {
  str = str.toLowerCase().split(/[\s_]+/).map(function(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(" ");
  return str;
}

// convert date to readable format
export function dateConvert(date: string): string {
  return new Date(parseInt(date) * 1000).toLocaleString();
}