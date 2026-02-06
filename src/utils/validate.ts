export const isValidTimestamp = (timestamp: number) => {
  return (
    timestamp.toString().length === 10 || timestamp.toString().length === 13
  )
}

export const isValidURL = (url: string) => {
  try {
    const _ = new URL(url)

    return true
  } catch (_) {
    return false
  }
}

export const EmailRegex = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{1,24}$/

export const isValidEmail = (email: string) => {
  return EmailRegex.test(email)
}

export const UsernameRegex = /^[\p{L}\p{N}!~_@#$%^&*()+=-]{1,17}$/u

export const isValidName = (name: string) => {
  return UsernameRegex.test(name)
}

export const PasswordRegex =
  /^(?=.*[a-zA-Z])(?=.*\d)[\w!@#$%^&*()+=\\/-]{6,1007}$/

export const isValidPassword = (pwd: string) => {
  return PasswordRegex.test(pwd)
}

export const ValidMailConfirmCodeRegex = /^[a-zA-Z0-9]{7}$/

export const isValidMailConfirmCode = (code: string) => {
  return ValidMailConfirmCodeRegex.test(code)
}

export const ResourceSizeRegex: RegExp = /^.{0,107}(mb|gb)$/i

export const VNDBRegex: RegExp = /^v\d{1,6}$/
