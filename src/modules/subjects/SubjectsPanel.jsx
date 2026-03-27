import { useState } from 'react'
import Panel from '../../components/Panel/Panel'
import { makeId } from '../../utils/helpers'
import './SubjectsPanel.scss'

export default function SubjectsPanel({ subjects, onUpdateSubjects }) {
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const trimmed = name.trim()

    if (!trimmed) {
      return
    }

    onUpdateSubjects([
      ...subjects,
      { id: makeId('subject'), name: trimmed, questions: [] },
    ])
    setName('')
  }

  function startEdit(subject) {
    setEditingId(subject.id)
    setEditName(subject.name)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditName('')
  }

  function saveEdit(subjectId) {
    const trimmed = editName.trim()
    if (!trimmed) return

    onUpdateSubjects(
      subjects.map((s) =>
        s.id === subjectId ? { ...s, name: trimmed } : s,
      ),
    )
    setEditingId(null)
    setEditName('')
  }

  function deleteSubject(subjectId) {
    onUpdateSubjects(subjects.filter((s) => s.id !== subjectId))
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
      </form>

      <div className="subject-list">
        {subjects.length === 0 ? (
          <p className="muted">Chưa có môn học nào.</p>
        ) : (
          subjects.map((subject) => (
            <article key={subject.id} className="subject-item">
              {editingId === subject.id ? (
                <div className="edit-row">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit(subject.id)
                      if (e.key === 'Escape') cancelEdit()
                    }}
                    autoFocus
                  />
                  <div className="action-buttons">
                    <button type="button" className="btn-save" onClick={() => saveEdit(subject.id)}>Lưu</button>
                    <button type="button" className="btn-cancel" onClick={cancelEdit}>Hủy</button>
                  </div>
                </div>
              ) : (
                <>
                  <h3>{subject.name}</h3>
                  <p>{subject.questions.length} câu hỏi</p>
                  <div className="action-buttons">
                    <button type="button" className="btn-edit" onClick={() => startEdit(subject)}>Sửa</button>
                    <button type="button" className="btn-delete" onClick={() => deleteSubject(subject.id)}>Xóa</button>
                  </div>
                </>
              )}
            </article>
          ))
        )}
      </div>
    </Panel>
  )
}
