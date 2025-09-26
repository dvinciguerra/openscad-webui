
// SHA-1 hash encoding function
// from https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
//
// @param {string} value - input to be hashed
// @return {Promise<string>} - SHA1 hash
export const encode = async (value) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);

  const buffer = await crypto.subtle.digest('SHA-1', data);
  const bufferItems = Array.from(new Uint8Array(buffer));

  // convert bytes to hex string
  return bufferItems
    .map((item) => item.toString(16).padStart(2, "0"))
    .join("")
}
