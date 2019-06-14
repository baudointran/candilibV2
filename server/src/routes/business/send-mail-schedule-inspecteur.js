import { appLogger } from '../../util'
import { getScheduleInspecteurTemplate } from './mail/body-schedule-inspecteur-template'
import { getHtmlBody } from './mail'
import { dateTimeToFormatFr } from '../../util/date.util'
import { sendMail } from './send-mail'
import { findInspecteurById } from '../../models/inspecteur'
import { findCentreById } from '../../models/centre'
import { findCandidatById } from '../../models/candidat'
import { getFailedScheduleInspecteurTemplate } from './mail/failed-mail-schelude-inspecteurs-template'

const getScheduleInspecteurBody = async (
  inspecteurName,
  inspecteurMatricule,
  date,
  centre,
  departement,
  places
) => {
  const action = 'get-body-shechule-inspecteur'
  appLogger.debug({ func: 'getScheduleInspecteurBody', action, places })

  if (!places || places.length === 0) {
    throw new Error('NO_PLACES')
  }

  const planning = {
    '08:00': {},
    '08:30': {},
    '09:00': {},
    '09:30': {},
    '10:00': {},
    '10:30': {},
    '11:00': {},
    '11:30': {},
    '13:30': {},
    '14:00': {},
    '14:30': {},
    '15:00': {},
    '15:30': {},
  }
  await Promise.all(
    places.map(async place => {
      const { candidat, date } = place
      const heure = dateTimeToFormatFr(date).hour
      let candidatObject
      if (candidat) {
        candidatObject = await findCandidatById(candidat, {
          codeNeph: 1,
          nomNaissance: 1,
          prenom: 1,
        })
        if (!candidatObject) {
          throw new Error('CANDIDAT_NOT_FOUND')
        }
      }
      const neph = (candidatObject && candidatObject.codeNeph) || ''
      const nom = (candidatObject && candidatObject.nomNaissance) || ''
      const prenom = (candidatObject && candidatObject.prenom) || ''

      planning[heure] = {
        neph,
        nom,
        prenom,
      }
      return planning[heure]
    })
  )

  const body = getScheduleInspecteurTemplate(
    inspecteurName,
    inspecteurMatricule,
    date,
    centre,
    departement,
    planning
  )

  return getHtmlBody(body)
}

export const sendScheduleInspecteur = async (
  email,
  places,
  inspecteur,
  centre
) => {
  const loggerInfo = {
    func: 'sendScheduleInspecteur',
    email,
    places,
    inspecteur,
    centre,
    action: 'SEND_SCHEDULE_INSPECTEUR',
  }

  appLogger.debug(loggerInfo)
  const action = 'SEND_SCHEDULE_INSPECTEUR'

  if (!email || !places || places.length <= 0) {
    const message = "L'adresse email ou la liste des créneaux sont manquantes."
    appLogger.error({ action, message })
    throw new Error(message)
  }

  const {
    inspecteur: inspecteurFromPlace,
    date,
    centre: centreFromPlace,
  } = places[0]

  let inspecteurObject = inspecteur || inspecteurFromPlace
  appLogger.debug({
    ...loggerInfo,
    description: "rechercher l'inspecteur",
    inspecteur_id: inspecteurObject.matricule,
    inspecteurObject,
  })

  if (!inspecteurObject.matricule || !inspecteurObject.nom) {
    inspecteurObject = await findInspecteurById(inspecteurObject._id)
    if (!inspecteurObject) {
      throw new Error('INSPECTEUR_NOT_FOUND')
    }
  }

  const inspecteurName = inspecteurObject.nom
  const inspecteurMatricule = inspecteurObject.matricule

  let centreObject = centre || centreFromPlace
  if (!centreObject.nom || !centreObject.departement) {
    centreObject = await findCentreById(centreObject._id)
    if (!centreObject) {
      throw new Error('CENTRE_NOT_FOUND')
    }
  }

  const centreNom = centreObject.nom
  const departement = centreObject.departement

  const dateToString = dateTimeToFormatFr(date).date
  const content = await getScheduleInspecteurBody(
    inspecteurName,
    inspecteurMatricule,
    dateToString,
    centreNom,
    departement,
    places
  )
  const subject = `Bordereau de l'inspecteur ${inspecteurName}/${inspecteurMatricule} pour le ${dateToString} au centre de ${centreNom} du département ${departement}`

  appLogger.debug({ func: 'sendScheduleInspecteur', content, subject })

  return sendMail(email, { content, subject })
}

export const sendMailForScheduleInspecteurFailed = async (
  email,
  date,
  departement,
  inspecteurs
) => {
  appLogger.debug({
    func: 'sendMailForScheduleInspecteurFailed',
    args: { email, date, departement, inspecteurs },
  })

  const dateToString = dateTimeToFormatFr(date).date

  const content = getFailedScheduleInspecteurTemplate(
    dateToString,
    inspecteurs.map(inspecteur => inspecteur.nom + '/' + inspecteur.matricule)
  )
  const subject = `Echec d'envoi de mail pour le planning du ${date} du département ${departement}`
  return sendMail(email, { content, subject })
}
