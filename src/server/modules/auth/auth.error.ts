export class InvalidTokenError extends Error {
  constructor() {
    super('Invalid token')
  }
}

export class UserNotFoundError extends Error {
  constructor() {
    super('User not found')
  }
}