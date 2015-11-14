var Buffer = require('buffer');


/*
 * Allocates a new buffer of size bytes. size must be less than 1,073,741,824 bytes (1 GB) 
 * on 32 bits architectures or 2,147,483,648 bytes (2 GB) on 64 bits architectures, otherwise 
 * a RangeError is thrown.
 */
str = '\u00bd + \u00bc = \u00be';

console.log(str + ": " + str.length + " characters, " +
  Buffer.byteLength(str, 'utf8') + " bytes");
