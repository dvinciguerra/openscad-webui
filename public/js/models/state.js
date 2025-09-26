// Save state to localStorage
export const setState = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('Error saving to localStorage', e)
  }
}

// Load state from localStorage
export const fetchState = (key, defaultValue = null) => {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : defaultValue
  } catch (e) {
    console.error('Error loading from localStorage', e)
    return defaultValue
  }
}
