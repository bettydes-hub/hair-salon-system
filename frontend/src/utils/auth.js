// Authentication utility functions

export const getToken = () => {
  return localStorage.getItem('token')
}

export const setToken = (token) => {
  localStorage.setItem('token', token)
}

export const removeToken = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export const getUser = () => {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

export const setUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user))
}

export const isAuthenticated = () => {
  return !!getToken()
}

export const isAdmin = () => {
  const user = getUser()
  return user?.role === 'admin'
}

export const isManager = () => {
  const user = getUser()
  return user?.role === 'manager'
}

export const isReceptionist = () => {
  const user = getUser()
  return user?.role === 'receptionist'
}

export const isClient = () => {
  const user = getUser()
  return user?.role === 'client'
}

export const isStaff = () => {
  const user = getUser()
  return user?.role && ['admin', 'manager', 'receptionist'].includes(user.role)
}

export const hasRole = (role) => {
  const user = getUser()
  return user?.role === role
}

