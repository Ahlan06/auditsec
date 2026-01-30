const STORAGE_KEY = 'auditsec_course_progress'

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch (e) {
    return {}
  }
}

function writeStorage(obj) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj))
  } catch (e) {
    // ignore
  }
}

export function getCourseProgress(id) {
  const all = readStorage()
  return all[id] || null
}

export function setCourseProgress(id, data) {
  const all = readStorage()
  all[id] = { ...(all[id] || {}), ...data }
  writeStorage(all)
}

export function toggleCourseCompleted(id) {
  const cur = getCourseProgress(id) || {}
  const completed = !cur.completed
  setCourseProgress(id, { completed, updatedAt: Date.now() })
  return completed
}

export function setCoursePercent(id, percent) {
  const cur = getCourseProgress(id) || {}
  setCourseProgress(id, { ...cur, percent, updatedAt: Date.now() })
}

export function getCoursePercent(id) {
  const cur = getCourseProgress(id) || {}
  return cur.percent || 0
}
