import CryptoJS from "crypto-js";

export const generateEncryption = ({
  plainText = "",
  signature = process.env.ENCRYPTION_SIGNATURE,
} = {}) => {
  const encryption = CryptoJS.AES.encrypt(plainText, signature).toString();
  return encryption;
};
export const decodeEncryption = ({
  cipherText = "",
  signature = process.env.ENCRYPTION_SIGNATURE,
} = {}) => {
  const decoded = CryptoJS.AES.decrypt(cipherText, signature).toString(
    CryptoJS.enc.Utf8
  );
  return decoded;
};
