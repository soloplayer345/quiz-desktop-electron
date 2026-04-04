import { useRef, useState } from 'react'
import Panel from '../../components/Panel/Panel'
import { makeId } from '../../utils/helpers'
import { exportSubject, importSubjectFromFile } from '../../utils/transfer'
import './SubjectsPanel.scss'

export default function SubjectsPanel({ subjects, onUpdateSubjects, onToast, onEdit, onStudy }) {
  const [name, setName] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const trimmed = name.trim()

    if (!trimmed) {
      onToast('Vui lòng nhập tên môn học!', 'danger')
      return
    }

    const isDuplicate = subjects.some(
      (s) => s.name.trim().toLowerCase() === trimmed.toLowerCase()
    )
    if (isDuplicate) {
      onToast('Môn học này đã tồn tại!', 'danger')
      return
    }

    onUpdateSubjects([
      ...subjects,
      { id: makeId('subject'), name: trimmed, questions: [] },
    ])
    setName('')
    onToast('Đã thêm môn học')
  }

  function handleExport(subject) {
    exportSubject(subject)
    onToast(`Đã xuất "${subject.name}"`)
  }

  const importRef = useRef(null)

  async function handleImportFile(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    try {
      const newSubject = await importSubjectFromFile(file)
      const existing = subjects.find(
        (s) => s.name.trim().toLowerCase() === newSubject.name.trim().toLowerCase()
      )

      if (existing) {
        const existingPrompts = new Set(existing.questions.map((q) => q.prompt.trim().toLowerCase()))
        const toAdd = newSubject.questions.filter(
          (q) => !existingPrompts.has(q.prompt.trim().toLowerCase())
        )
        const merged = { ...existing, questions: [...existing.questions, ...toAdd] }
        onUpdateSubjects(subjects.map((s) => (s.id === existing.id ? merged : s)))
        const skipNote = newSubject._skipped > 0 ? ` — bỏ qua ${newSubject._skipped} câu không hợp lệ` : ''
        onToast(
          toAdd.length > 0
            ? `Đã gộp vào "${existing.name}": +${toAdd.length} câu mới (bỏ qua ${newSubject.questions.length - toAdd.length} câu trùng${skipNote})`
            : `Không có câu hỏi mới để gộp vào "${existing.name}"${skipNote}`,
          toAdd.length > 0 ? 'success' : 'info'
        )
      } else {
        onUpdateSubjects([...subjects, newSubject])
        const skipNote = newSubject._skipped > 0 ? ` (bỏ qua ${newSubject._skipped} câu không hợp lệ)` : ''
        onToast(`Đã nhập "${newSubject.name}" (${newSubject.questions.length} câu hỏi${skipNote})`)
      }
    } catch (err) {
      onToast(err.message, 'danger')
    }
  }

  return (
    <Panel title="Tạo môn học">
      <form className="form" onSubmit={handleSubmit}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ví dụ: Toán, Lý, Hóa"
        />
        <button type="submit">Thêm môn</button>
        <button type="button" className="btn-import" onClick={() => importRef.current?.click()}>
          Nhập từ JSON
        </button>
        <input
          ref={importRef}
          type="file"
          accept=".json,application/json"
          className="visually-hidden"
          onChange={handleImportFile}
        />
      </form>

      <details className="import-guide">
        <summary>📄 Định dạng file JSON để nhập</summary>
        <div className="import-guide__body">
          <p>File phải là <code>.json</code> với cấu trúc sau. Mỗi câu hỏi cần ít nhất <strong>2 lựa chọn</strong> và đúng <strong>1 đáp án đúng</strong> (<code>"correct": true</code>).</p>
          <pre>{`{
  "version": 1,
  "name": "Tên môn học",
  "questions": [
    {
      "prompt": "Câu hỏi số 1?",
      "options": [
        { "text": "Đáp án A", "correct": false },
        { "text": "Đáp án B", "correct": true },
        { "text": "Đáp án C", "correct": false },
        { "text": "Đáp án D", "correct": false }
      ]
    },
    {
      "prompt": "Câu hỏi số 2?",
      "options": [
        { "text": "Đáp án A", "correct": true },
        { "text": "Đáp án B", "correct": false }
      ]
    }
  ]
}`}</pre>
          <ul>
            <li><code>"name"</code> — tên môn học (bắt buộc)</li>
            <li><code>"prompt"</code> — nội dung câu hỏi (bắt buộc)</li>
            <li><code>"text"</code> — nội dung lựa chọn (bắt buộc)</li>
            <li><code>"correct": true</code> — đánh dấu đáp án đúng (bắt buộc, mỗi câu ít nhất 1)</li>
          </ul>
          <p className="import-guide__note">Câu hỏi thiếu <code>prompt</code>, thiếu <code>correct</code>, hoặc có ít hơn 2 lựa chọn sẽ tự động bị bỏ qua khi nhập.</p>
        </div>
      </details>

      <div className="subject-list">
        {subjects.length === 0 ? (
          <p className="muted">Chưa có môn học nào.</p>
        ) : (
          subjects.map((subject) => (
            <article key={subject.id} className="subject-item">
              <h3>{subject.name}</h3>
              <p>{subject.questions.length} câu hỏi</p>
              <div className="action-buttons">
                <button type="button" className="btn-study" onClick={() => onStudy(subject.id)}>▶ Ôn bài</button>
                <button type="button" className="btn-export" onClick={() => handleExport(subject)} title="Xuất file JSON">⬇ Xuất</button>
                <button type="button" className="btn-edit" onClick={() => onEdit(subject.id)}>Sửa</button>
              </div>
            </article>
          ))
        )}
      </div>
    </Panel>
  )
}
