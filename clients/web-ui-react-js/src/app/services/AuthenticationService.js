import axios from 'axios'

import { defaultServerUrl } from '../../config'

const SERVER_URL = process.env.API_URL || defaultServerUrl
const tokenLocalStorageKey = 'Authorization'

class AuthenticationService {

  static isAuthenticated () {
    return this.getToken() !== undefined && this.getToken() !== null
  }

  static getToken() {
    return window.localStorage.getItem(tokenLocalStorageKey)
  }

  static updateToken(token) {
    window.localStorage.setItem(tokenLocalStorageKey, token)
  }

  static removeToken() {
    window.localStorage.removeItem(tokenLocalStorageKey)
  }

  static currentTokenWasRefusedByApi() {
    this.removeToken();
  }

  static async login(username, password) {
    return axios({
      method: 'post',
      url: SERVER_URL + '/user/login',
      data: { username, password },
    })
      .then((response) => {
        this.updateToken(response.data.token)
        return response
      })
      .catch((error) => {
        console.error(error)
        throw error
      })
  }

  static async logout() {
    return axios({
      method: 'post',
      url: SERVER_URL + '/user/logout',
    })
      .then(() => {
        AuthenticationService.removeToken();
      })
      .catch((error) => {
        console.error(error);
        if (error.response.status === 401) {
          this.currentTokenWasRefusedByApi()
        } else { throw error; }
      })
  }

}

export default AuthenticationService
