export class InvalidTokenError extends Error {
  constructor() {
    super('Invalid token')
  }
}

export class UserNotFoundError extends Error {
  constructor(message = 'User not found') {
    super(message)
  }
}

export class EmailAlreadyInUseError extends Error {
  constructor(message = 'Email already in use') {
    super(message)
  }
}