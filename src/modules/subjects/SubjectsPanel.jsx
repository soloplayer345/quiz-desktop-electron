import { useRef, useState } from 'react'
import Panel from '../../components/Panel/Panel'
import { makeId } from '../../utils/helpers'
import { exportSubject, importSubjectFromFile } from '../../utils/transfer'
import './SubjectsPanel.scss'

export default function SubjectsPanel({ subjects, onUpdateSubjects, onToast }) {
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
    onToast('Đã thêm môn học')
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
    onToast('Đã cập nhật môn học')
  }

  function deleteSubject(subjectId) {
    onUpdateSubjects(subjects.filter((s) => s.id !== subjectId))
    onToast('Đã xóa môn học', 'danger')
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
      onUpdateSubjects([...subjects, newSubject])
      onToast(`Đã nhập "${newSubject.name}" (${newSubject.questions.length} câu hỏi)`)
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
                    <button type="button" className="btn-export" onClick={() => handleExport(subject)} title="Xuất file JSON">⬇ Xuất</button>
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
