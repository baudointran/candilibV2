import request from 'supertest'
import { connect, disconnect } from '../../mongo-connection'
import {
  createCentres,
  removeCentres,
  createPlaces,
  removePlaces,
  centres,
  createCandidats,
  deleteCandidats,
  makeResas,
} from '../../models/__tests__/'

import { DateTime } from 'luxon'
import { NOT_CODE_DEP_MSG } from './centre.controllers'

const { default: app, apiPrefix } = require('../../app')

jest.mock('../middlewares/verify-token')

describe('Test centre controllers', () => {
  beforeAll(async () => {
    await connect()
  })

  afterAll(async () => {
    await disconnect()
    await app.close()
  })

  describe('Find centres', () => {
    beforeAll(async () => {
      await createCandidats()
      await createCentres()
      await createPlaces()
      await makeResas()
    })
    afterAll(async () => {
      await removePlaces()
      await removeCentres()
      await deleteCandidats()
    })
    it('Should response 400 to find  centres without departement', async () => {
      const { body } = await request(app)
        .get(`${apiPrefix}/candidat/centres`)
        .send()
        .set('Accept', 'application/json')
        .expect(400)

      expect(body).toBeDefined()
      expect(body).toHaveProperty('success', false)
      expect(body).toHaveProperty('message', NOT_CODE_DEP_MSG)
    })
    it('Should response 200 to find 2 centres from departemnt 93 to date 19', async () => {
      const departement = '93'
      const date = encodeURIComponent(DateTime.fromObject({ day: 19 }).toISO())
      const { body } = await request(app)
        .get(
          `${apiPrefix}/candidat/centres?departement=${departement}&begin=${date}`
        )
        .send()
        .set('Accept', 'application/json')
        .expect(200)

      expect(body).toBeDefined()
      expect(body).toHaveLength(2)
      body.forEach(element => {
        if (element.centre.nom === centres[0].nom) {
          expect(element.count).toBe(0)
        }
        if (element.centre.nom === centres[1].nom) {
          expect(element.count).toBe(1)
        }
        if (element.centre.nom === centres[2].nom) {
          expect(element.count).toBe(4)
        }
      })
    })

    it('Should response 200 to find 2 centres from departemnt 93 to date 20', async () => {
      const departement = '93'
      const date = encodeURIComponent(DateTime.fromObject({ day: 20 }).toISO())
      const { body } = await request(app)
        .get(
          `${apiPrefix}/candidat/centres?departement=${departement}&begin=${date}`
        )
        .send()
        .set('Accept', 'application/json')
        .expect(200)

      expect(body).toBeDefined()
      expect(body).toHaveLength(2)
      body.forEach(element => {
        if (element.centre.nom === centres[0].nom) {
          expect(element.count).toBe(0)
        }
        if (element.centre.nom === centres[1].nom) {
          expect(element.count).toBe(0)
        }
        if (element.centre.nom === centres[2].nom) {
          expect(element.count).toBe(3)
        }
      })
    })
    it('Should response 200 and a center', async () => {
      const nom = 'Centre 1'
      const departement = '92'
      const { body: centre } = await request(app)
        .get(
          `${apiPrefix}/candidat/centres?nom=${nom}&departement=${departement}`
        )
        .set('Accept', 'application/json')
        .expect(200)

      expect(centre).toBeDefined()
      expect(centre).not.toBeNull()
      expect(centre).toHaveProperty('nom', nom)
      expect(centre).toHaveProperty('departement', departement)
      expect(centre.adresse).toContain(departement)
    })
  })
})