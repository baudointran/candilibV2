import { SUBJECT_CONVOCATION } from '../send-message-constants'
import { getConvocationBody } from '../build-mail-convocation'

export function expectMailConvocation (candidat, place) {
  const bodyMail = require('../send-mail').getMail()
  expect(bodyMail).toBeDefined()
  expect(bodyMail).toHaveProperty('to', candidat.email)
  expect(bodyMail).toHaveProperty('subject', SUBJECT_CONVOCATION)
  place.candidat = candidat
  expect(bodyMail).toHaveProperty('html', getConvocationBody(place))
}
