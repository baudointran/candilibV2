// import arrayTestOfCenters from '@/views/candidat/components/centers-selections/arrayTestOfCenters'
import api from '@/api'
import { SHOW_ERROR } from './message'

export const FETCH_CENTERS_REQUEST = 'FETCH_CENTERS_REQUEST'
export const FETCH_CENTERS_SUCCESS = 'FETCH_CENTERS_SUCCESS'
export const FETCH_CENTERS_FAILURE = 'FETCH_CENTERS_FAILURE'
export const SELECT_CENTER = 'SELECT_CENTER'

export default {
  state: {
    isCentersFetching: false,
    fetchedCenters: [],
    selectedCenter: undefined,
  },
  mutations: {
    [FETCH_CENTERS_REQUEST] (state) {
      state.isCentersFetching = true
    },
    [FETCH_CENTERS_SUCCESS] (state, centers) {
      state.isCentersFetching = false
      state.fetchedCenters = centers
    },
    [FETCH_CENTERS_FAILURE] (state) {
      state.isCentersFetching = false
    },
    [SELECT_CENTER] (state, selectedCenter) {
      state.selectedCenter = selectedCenter
    },
  },
  actions: {
    async [FETCH_CENTERS_REQUEST] ({ commit, dispatch }) {
      commit(FETCH_CENTERS_REQUEST)
      try {
        const result = await api.candidat.getCentres()
        // const result = arrayTestOfCenters
        commit(FETCH_CENTERS_SUCCESS, result)
      } catch (error) {
        commit(FETCH_CENTERS_FAILURE, error.message)
        dispatch(SHOW_ERROR, error.message)
      }
    },
    [SELECT_CENTER] ({ commit }, center) {
      commit(SELECT_CENTER, center)
    },
  },
}
