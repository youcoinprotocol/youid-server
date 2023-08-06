import * as crypto from 'crypto'

export function encryptAES(input: string, key: string): string {
  const iv = crypto.randomBytes(16)
  const hashedKey = generateMD5Hash(key)
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(hashedKey), iv)

  let encrypted = cipher.update(input)
  encrypted = Buffer.concat([encrypted, cipher.final()])

  return Buffer.from(iv.toString('base64') + ':' + encrypted.toString('base64')).toString('base64')
}

export function decryptAES(encryptedData: string, key: string): string {
  const hashedKey = generateMD5Hash(key)
  const [ivString, encryptedString] = Buffer.from(encryptedData, 'base64').toString().split(':')
  const iv = Buffer.from(ivString, 'base64')
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(hashedKey), iv)

  let decrypted = decipher.update(Buffer.from(encryptedString, 'base64'))
  decrypted = Buffer.concat([decrypted, decipher.final()])

  return decrypted.toString()
}

export function generateMD5Hash(input: string): string {
  const md5Hash = crypto.createHash('md5').update(input).digest('hex')
  return md5Hash
}
