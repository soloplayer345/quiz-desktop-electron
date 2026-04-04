import { makeId } from './helpers'

const FILE_VERSION = 1

/**
 * Download a subject as a .quiz.json file.
 */
export function exportSubject(subject) {
  const payload = {
    version: FILE_VERSION,
    name: subject.name,
    questions: subject.questions.map(({ prompt, options }) => ({
      prompt,
      options: options.map(({ text, correct }) => ({ text, correct })),
    })),
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${subject.name.replace(/[\\/:*?"<>|]/g, '_')}.quiz.json`
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Read a .quiz.json File and return a new subject object (with fresh IDs).
 * Throws a descriptive Error if the file is invalid.
 */
export async function importSubjectFromFile(file) {
  const text = await file.text()
  let data

  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('File không hợp lệ (không phải JSON).')
  }

  if (!data.name || !Array.isArray(data.questions)) {
    throw new Error('File không đúng định dạng quiz.')
  }

  const skipped = []
  const questions = data.questions
    .filter((q) => {
      if (
        !q.prompt ||
        !Array.isArray(q.options) ||
        q.options.length < 2 ||
        !q.options.some((o) => o.correct)
      ) {
        if (q.prompt) skipped.push(q.prompt)
        return false
      }
      return true
    })
    .map((q) => ({
      id: makeId('question'),
      prompt: q.prompt,
      options: q.options.map(({ text, correct }) => ({ text: text ?? '', correct: !!correct })),
    }))

  if (questions.length === 0) {
    throw new Error('Không tìm thấy câu hỏi hợp lệ nào trong file.')
  }

  return {
    id: makeId('subject'),
    name: String(data.name),
    questions,
    _skipped: skipped.length,
  }
}
