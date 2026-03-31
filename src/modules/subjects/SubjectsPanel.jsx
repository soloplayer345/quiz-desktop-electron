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
        onToast(
          toAdd.length > 0
            ? `Đã gộp vào "${existing.name}": +${toAdd.length} câu mới (bỏ qua ${newSubject.questions.length - toAdd.length} câu trùng)`
            : `Không có câu hỏi mới để gộp vào "${existing.name}"`,
          toAdd.length > 0 ? 'success' : 'info'
        )
      } else {
        onUpdateSubjects([...subjects, newSubject])
        onToast(`Đã nhập "${newSubject.name}" (${newSubject.questions.length} câu hỏi)`)
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
