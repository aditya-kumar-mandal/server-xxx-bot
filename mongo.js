s ="hi. dick.54 xxx, chutiye, lund."

let re = new RegExp('/[^A-Za-z-]/g');
word_array = s.replace(re, "  ").replace(/\s+/g, " ").split(" ")

console.log(word_array);