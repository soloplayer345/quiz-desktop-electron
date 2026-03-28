const STORAGE_KEY = 'quiz-desktop-storage-v1'

// Electron: dùng file JSON trong userData (persist qua mọi chế độ chạy)
// Browser dev: dùng localStorage làm fallback
const isElectron = typeof window !== 'undefined' && !!window.quizStorage

export async function loadSubjectsAsync() {
  if (isElectron) {
    return window.quizStorage.load()
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveSubjects(subjects) {
  if (isElectron) {
    window.quizStorage.save(subjects)
    return
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects))
}

// Giữ lại export đồng bộ để tương thích (chỉ dùng được ở browser dev)
export function loadSubjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
