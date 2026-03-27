const STORAGE_KEY = 'quiz-desktop-storage-v1'

export function loadSubjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
  } catch {
    return []
  }
}

export function saveSubjects(subjects) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects))
}
