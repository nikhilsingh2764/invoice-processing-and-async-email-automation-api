import { OTP } from '../config/features.js'

/** OTP entry state machine: entering -> verifying -> success | entering (wrong++) | expired | locked after 5 wrong codes. */
export const initialOtp = { digits: Array(6).fill(''), phase: 'entering', wrong: 0, message: '' }
export function otpReducer(state, a) {
  switch (a.type) {
    case 'digits':
      return state.phase === 'locked' || state.phase === 'expired' ? state : { ...state, digits: a.digits, message: '' }
    case 'verifying':
      return { ...state, phase: 'verifying', message: '' }
    case 'wrong': {
      const wrong = state.wrong + 1
      return wrong >= OTP.maxWrongCodes
        ? { ...state, phase: 'locked', wrong, digits: Array(6).fill(''), message: 'Too many wrong codes. Start again to get a new one.' }
        : { ...state, phase: 'entering', wrong, digits: Array(6).fill(''), message: `That code is not right. ${OTP.maxWrongCodes - wrong} ${OTP.maxWrongCodes - wrong === 1 ? 'try' : 'tries'} left.` }
    }
    case 'error':
      return { ...state, phase: 'entering', message: a.message }
    case 'expired':
      return { ...state, phase: 'expired', digits: Array(6).fill(''), message: 'This code has expired. Start again to get a new one.' }
    case 'success':
      return { ...state, phase: 'success' }
    default:
      return state
  }
}

