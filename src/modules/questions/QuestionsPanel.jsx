import { useMemo, useState } from 'react'
import Panel from '../../components/Panel/Panel'
import { makeId } from '../../utils/helpers'
import './QuestionsPanel.scss'

function labelOf(i) {
  return String.fromCharCode(65 + i)
}

function emptyOptions() {
  return [
    { text: '', correct: false },
    { text: '', correct: false },
  ]
}

// Backward-compat: convert old { correct, wrong[] } format to options array
function questionToOptions(question) {
  if (question.options) return question.options
  return [
    { text: question.correct ?? '', correct: true },
    ...(question.wrong ?? []).map((w) => ({ text: w, correct: false })),
  ]
}

export default function QuestionsPanel({ subjects, onUpdateSubjects }) {
  const [selectedId, setSelectedId] = useState('')
  const [questionText, setQuestionText] = useState('')
  const [options, setOptions] = useState(emptyOptions)
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState(null)

  const selectedSubject = useMemo(
    () => subjects.find((s) => s.id === selectedId) ?? null,
    [subjects, selectedId],
  )

  function clearForm() {
    setQuestionText('')
    setOptions(emptyOptions())
  }

  function updateOption(index, field, value) {
    setOptions((prev) => prev.map((o, i) => (i === index ? { ...o, [field]: value } : o)))
  }

  function addOption() {
    setOptions((prev) => [...prev, { text: '', correct: false }])
  }

  function removeOption(index) {
    setOptions((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSubmit(event) {
    event.preventDefault()

    const prompt = questionText.trim()
    const filled = options.map((o) => ({ ...o, text: o.text.trim() }))
    const hasAllFilled = filled.every((o) => o.text !== '')
    const hasCorrect = filled.some((o) => o.correct)

    if (!selectedId || !prompt || !hasAllFilled || !hasCorrect) return

    const question = {
      id: makeId('question'),
      prompt,
      options: filled,
    }

    const nextSubjects = subjects.map((subject) => {
      if (subject.id !== selectedId) {
        return subject
      }

      return {
        ...subject,
        questions: [...subject.questions, question],
      }
    })

    onUpdateSubjects(nextSubjects)
    clearForm()
  }

  function startEdit(question) {
    setEditingId(question.id)
    setEditData({
      prompt: question.prompt,
      options: questionToOptions(question),
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditData(null)
  }

  function updateEditOption(index, field, value) {
    setEditData((prev) => ({
      ...prev,
      options: prev.options.map((o, i) => (i === index ? { ...o, [field]: value } : o)),
    }))
  }

  function addEditOption() {
    setEditData((prev) => ({ ...prev, options: [...prev.options, { text: '', correct: false }] }))
  }

  function removeEditOption(index) {
    setEditData((prev) => ({ ...prev, options: prev.options.filter((_, i) => i !== index) }))
  }

  function saveEdit(questionId) {
    if (!editData) return

    const prompt = editData.prompt.trim()
    const filled = editData.options.map((o) => ({ ...o, text: o.text.trim() }))
    const hasAllFilled = filled.every((o) => o.text !== '')
    const hasCorrect = filled.some((o) => o.correct)

    if (!prompt || !hasAllFilled || !hasCorrect) return

    const nextSubjects = subjects.map((subject) => {
      if (subject.id !== selectedId) return subject

      return {
        ...subject,
        questions: subject.questions.map((q) =>
          q.id === questionId
            ? { ...q, prompt, options: filled }
            : q,
        ),
      }
    })

    onUpdateSubjects(nextSubjects)
    cancelEdit()
  }

  function deleteQuestion(questionId) {
    const nextSubjects = subjects.map((subject) => {
      if (subject.id !== selectedId) return subject

      return {
        ...subject,
        questions: subject.questions.filter((q) => q.id !== questionId),
      }
    })

    onUpdateSubjects(nextSubjects)
  }

  return (
    <Panel title="Nhập câu hỏi cho môn học">
      <form className="form stacked" onSubmit={handleSubmit}>
        <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
          <option value="">Chọn môn học</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>

        <textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Nội dung câu hỏi"
          rows={3}
        />

        <p className="options-hint">Nhập đáp án và tích vào ô đúng (có thể chọn nhiều)</p>
        <div className="option-rows">
          {options.map((opt, i) => (
            <div key={i} className={`option-row${opt.correct ? ' is-correct' : ''}`}>
              <label className="option-label">{labelOf(i)}</label>
              <input
                className="option-input"
                value={opt.text}
                onChange={(e) => updateOption(i, 'text', e.target.value)}
                placeholder={`Đáp án ${labelOf(i)}`}
              />
              <label className="correct-toggle" title="Đáp án đúng">
                <input
                  type="checkbox"
                  checked={opt.correct}
                  onChange={(e) => updateOption(i, 'correct', e.target.checked)}
                />
                <span className="checkmark" />
              </label>
              {options.length > 2 && (
                <button
                  type="button"
                  className="btn-remove-option"
                  onClick={() => removeOption(i)}
                  title="Xóa đáp án này"
                >✕</button>
              )}
            </div>
          ))}
        </div>
        <button type="button" className="btn-add-option" onClick={addOption}>
          + Thêm đáp án
        </button>

        <button type="submit">Lưu câu hỏi</button>
      </form>

      {selectedSubject ? (
        <>
          <p className="hint">
            Môn <strong>{selectedSubject.name}</strong> đang có{' '}
            <strong>{selectedSubject.questions.length}</strong> câu hỏi.
          </p>

          {selectedSubject.questions.length > 0 && (
            <div className="question-list">
              {selectedSubject.questions.map((q, idx) => {
                const opts = questionToOptions(q)
                return (
                  <article key={q.id} className="question-item">
                    {editingId === q.id ? (
                      <div className="edit-question">
                        <textarea
                          value={editData.prompt}
                          onChange={(e) => setEditData({ ...editData, prompt: e.target.value })}
                          rows={2}
                          autoFocus
                        />
                        <div className="option-rows">
                          {editData.options.map((opt, i) => (
                            <div key={i} className={`option-row${opt.correct ? ' is-correct' : ''}`}>
                              <label className="option-label">{labelOf(i)}</label>
                              <input
                                className="option-input"
                                value={opt.text}
                                onChange={(e) => updateEditOption(i, 'text', e.target.value)}
                                placeholder={`Đáp án ${labelOf(i)}`}
                              />
                              <label className="correct-toggle" title="Đáp án đúng">
                                <input
                                  type="checkbox"
                                  checked={opt.correct}
                                  onChange={(e) => updateEditOption(i, 'correct', e.target.checked)}
                                />
                                <span className="checkmark" />
                              </label>
                              {editData.options.length > 2 && (
                                <button
                                  type="button"
                                  className="btn-remove-option"
                                  onClick={() => removeEditOption(i)}
                                  title="Xóa đáp án này"
                                >✕</button>
                              )}
                            </div>
                          ))}
                        </div>
                        <button type="button" className="btn-add-option" onClick={addEditOption}>
                          + Thêm đáp án
                        </button>
                        <div className="action-buttons">
                          <button type="button" className="btn-save" onClick={() => saveEdit(q.id)}>Lưu</button>
                          <button type="button" className="btn-cancel" onClick={cancelEdit}>Hủy</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="question-header">
                          <span className="question-num">#{idx + 1}</span>
                          <p className="question-prompt">{q.prompt}</p>
                        </div>
                        <div className="answer-tags">
                          {opts.map((opt, i) => (
                            <span key={i} className={`tag ${opt.correct ? 'correct' : 'wrong'}`}>
                              {opt.correct ? '✓' : '✗'} {labelOf(i)}. {opt.text}
                            </span>
                          ))}
                        </div>
                        <div className="action-buttons">
                          <button type="button" className="btn-edit" onClick={() => startEdit(q)}>Sửa</button>
                          <button type="button" className="btn-delete" onClick={() => deleteQuestion(q.id)}>Xóa</button>
                        </div>
                      </>
                    )}
                  </article>
                )
              })}
            </div>
          )}
        </>
      ) : (
        <p className="muted">Chọn môn học để bắt đầu nhập câu hỏi.</p>
      )}
    </Panel>
  )
}
