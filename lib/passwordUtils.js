const crypto = require('crypto');

// Constants from pbkdf2.compat.php (though algorithm and iterations are read from the hash string itself)
// const PBKDF2_COMPAT_HASH_ALGORITHM = 'sha256'; // Default in PHP if not in hash string
// const PBKDF2_COMPAT_ITERATIONS = 12000; // Default in PHP if not in hash string

// Compares two strings $a and $b in length-constant time.
function slowEquals(a, b) {
    let diff = a.length ^ b.length;
    for (let i = 0; i < a.length && i < b.length; i++) {
        diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return diff === 0;
}

/**
 * Verifies a password against a GNUBoard hash.
 * @param {string} password The password to verify.
 * @param {string} gnuBoardHash The hash string from GNUBoard's database (mb_password).
 * @returns {boolean} True if the password matches, false otherwise.
 */
async function verifyPassword(password, gnuBoardHash) {
    if (!gnuBoardHash || typeof gnuBoardHash !== 'string') {
        console.error("Invalid hash provided to verifyPassword");
        return false;
    }

    const params = gnuBoardHash.split(':');
    if (params.length < 4) {
        // This might be an old sql_password() hash if G5_STRING_ENCRYPT_FUNCTION was different
        // For now, we only support pbkdf2 hashes.
        // GNUBoard's `check_password` would try sql_password if `create_hash` was not the defined function.
        // And `login_password_check` handles migration from sql_password to create_hash.
        // This Node.js version currently assumes only create_hash (PBKDF2) is used.
        console.warn("Hash format is not PBKDF2-like:", gnuBoardHash);

        // Fallback for old mysql_password (less secure, length 41 or 16)
        // This requires a separate implementation of MySQL's PASSWORD() function.
        // For this example, we'll assume only PBKDF2 or return false.
        // if (gnuBoardHash.length === 41 || gnuBoardHash.length === 16) {
        //     // const mysqlPasswordHash = await oldSqlPassword(password); // Needs implementation
        //     // return slowEquals(gnuBoardHash, mysqlPasswordHash);
        // }
        return false;
    }

    const algorithm = params[0].toLowerCase(); // e.g., 'sha256'
    const iterations = parseInt(params[1], 10);
    const salt = Buffer.from(params[2], 'base64'); // Salt is base64 encoded in the hash string
    const storedKey = Buffer.from(params[3], 'base64'); // The actual hash key is also base64 encoded

    if (isNaN(iterations) || iterations <= 0) {
        console.error("Invalid iteration count in hash:", gnuBoardHash);
        return false;
    }
    if (!salt || salt.length === 0) {
        console.error("Invalid salt in hash:", gnuBoardHash);
        return false;
    }

    // The key length is derived from the stored key itself
    const keyLength = storedKey.length;

    try {
        const derivedKey = crypto.pbkdf2Sync(
            password,
            salt,
            iterations,
            keyLength,
            algorithm
        );
        return slowEquals(storedKey, derivedKey);
    } catch (e) {
        // This can happen if the algorithm is not supported by Node's crypto,
        // e.g. if GNUBoard used 'sha1' in its pbkdf2 (params[0] would be 'sha1').
        // The PHP pbkdf2_default handles this by falling back.
        if (algorithm === 'sha1' && e.message.includes('Unknown digest')) { // Node might support sha1 for pbkdf2
             console.warn("SHA1 digest for PBKDF2 might not be directly supported or errored. Trying with Node's default behavior if possible or check Node version.");
             // Node's pbkdf2Sync generally supports 'sha1'. If it errors, it's an issue.
        }
        console.error(`Error during pbkdf2Sync (algorithm: ${algorithm}, iterations: ${iterations}):`, e);
        return false;
    }
}

const PBKDF2_COMPAT_HASH_ALGORITHM = 'sha256';
const PBKDF2_COMPAT_ITERATIONS = 12000;
const PBKDF2_COMPAT_SALT_BYTES = 24; // Original PHP uses 24 bytes for salt from /dev/urandom then base64 encodes it.
                                     // crypto.randomBytes will give raw bytes.
const PBKDF2_COMPAT_HASH_BYTES = 24;


/**
 * Creates a GNUBoard-compatible PBKDF2 hash.
 * @param {string} password The password to hash.
 * @returns {string} The hash string in GNUBoard format (algorithm:iterations:salt:hash).
 */
async function hashPassword(password) {
    // 1. Generate salt
    // GNUBoard's pbkdf2.compat.php uses base64_encode on raw random bytes for the salt string.
    // We need to replicate that for the salt part of the hash string.
    const saltBytes = crypto.randomBytes(PBKDF2_COMPAT_SALT_BYTES);
    const saltString = saltBytes.toString('base64');

    // 2. Derive key
    // The salt passed to pbkdf2Sync should be the raw bytes, not the base64 string.
    // However, the original PHP code uses the base64 encoded salt *as the salt* for the pbkdf2 function
    // if mcrypt_create_iv or /dev/urandom is used. This is unusual but needs to be matched.
    // Let's re-check the PHP pbkdf2_default: it passes the $salt string (which is base64)
    // directly to hash_pbkdf2 or its own HMAC loop.
    // Node's crypto.pbkdf2Sync expects the salt as a string or Buffer.
    // If it's a string, it's used directly. If it's base64, it should be decoded first if the C++ layer expects raw bytes.
    // Let's assume the PHP hash_pbkdf2 and its internal HMAC take the salt string as is.

    const derivedKey = crypto.pbkdf2Sync(
        password,
        saltString, // Using the base64 encoded salt string directly as the salt, to match PHP's behavior
        PBKDF2_COMPAT_ITERATIONS,
        PBKDF2_COMPAT_HASH_BYTES,
        PBKDF2_COMPAT_HASH_ALGORITHM
    );

    const derivedKeyBase64 = derivedKey.toString('base64');

    return `${PBKDF2_COMPAT_HASH_ALGORITHM}:${PBKDF2_COMPAT_ITERATIONS}:${saltString}:${derivedKeyBase64}`;
}

module.exports = {
    verifyPassword,
    hashPassword,
};
