// Cookie utility functions for secure session management

export const cookieService = {
  // Set a cookie
  set: (name: string, value: string, days: number = 7) => {
    if (typeof window === 'undefined') return
    
    const expires = new Date()
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
    
    const cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Strict; Secure`
    document.cookie = cookie
  },

  // Get a cookie
  get: (name: string): string | null => {
    if (typeof window === 'undefined') return null
    
    const nameEQ = name + "="
    const cookies = document.cookie.split(';')
    
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i]
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1, cookie.length)
      }
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length, cookie.length))
      }
    }
    return null
  },

  // Delete a cookie
  delete: (name: string) => {
    if (typeof window === 'undefined') return
    
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
  },

  // Check if a cookie exists
  exists: (name: string): boolean => {
    return cookieService.get(name) !== null
  }
}
