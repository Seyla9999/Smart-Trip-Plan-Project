import axios from 'axios'

const API = 'http://localhost:3000'

export const login = (email: string, password: string) => {
  return axios.post(`${API}/auth/login`, { email, password })
}

export const register = (data: any) => {
  return axios.post(`${API}/auth/register`, data)
}