import { useMemo, useRef, useState } from 'react'
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
    { text: '', correct: false },
    { text: '', correct: false },
  ]
}

// Normalize prompt text for duplicate comparison
function normalizeText(text) {
  return text.trim().toLowerCase().replace(/\s+/g, ' ')
}

// Backward-compat: convert old { correct, wrong[] } format to options array
function questionToOptions(question) {
  if (question.options) return question.options
  return [
    { text: question.correct ?? '', correct: true },
    ...(question.wrong ?? []).map((w) => ({ text: w, correct: false })),
  ]
}

export default function QuestionsPanel({ subject, subjects, onUpdateSubjects, onToast, onBack, onDeleteSubject }) {
  const [questionText, setQuestionText] = useState('')
  const [options, setOptions] = useState(emptyOptions)
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState(null)
  const [search, setSearch] = useState('')
  const [listMode, setListMode] = useState('grid') // 'grid' | 'list'
  const listRef = useRef(null)

  function jumpToQuestion(idx) {
    setSearch('')
    setListMode('list')
    setTimeout(() => {
      const el = listRef.current?.querySelector(`[data-qidx="${idx}"]`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 0)
  }

  // Subject rename state
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState(subject.name)

  // Real-time duplicate check while typing
  const duplicateWarning = useMemo(() => {
    const normalized = normalizeText(questionText)
    if (!normalized) return null
    const match = subject.questions.find(
      (q) => normalizeText(q.prompt) === normalized,
    )
    return match ?? null
  }, [questionText, subject])

  const filteredQuestions = useMemo(() => {
    if (!search.trim()) return subject.questions
    const q = search.trim().toLowerCase()
    return subject.questions.filter(
      (item) =>
        item.prompt.toLowerCase().includes(q) ||
        questionToOptions(item).some((o) => o.text.toLowerCase().includes(q)),
    )
  }, [subject, search])

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

    if (!prompt || !hasAllFilled || !hasCorrect) return

    // Check duplicate
    const normalized = normalizeText(prompt)
    const isDuplicate = subject.questions.some(
      (q) => normalizeText(q.prompt) === normalized,
    )
    if (isDuplicate) {
      onToast('Câu hỏi này đã tồn tại trong môn học!', 'danger')
      return
    }

    const question = {
      id: makeId('question'),
      prompt,
      options: filled,
    }

    onUpdateSubjects(
      subjects.map((s) =>
        s.id === subject.id ? { ...s, questions: [...s.questions, question] } : s,
      ),
    )
    clearForm()
    onToast('Đã thêm câu hỏi')
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

    // Check duplicate (exclude the question being edited)
    const normalized = normalizeText(prompt)
    const isDuplicate = subject.questions.some(
      (q) => q.id !== questionId && normalizeText(q.prompt) === normalized,
    )
    if (isDuplicate) {
      onToast('Câu hỏi này đã tồn tại trong môn học!', 'danger')
      return
    }

    onUpdateSubjects(
      subjects.map((s) => {
        if (s.id !== subject.id) return s
        return {
          ...s,
          questions: s.questions.map((q) =>
            q.id === questionId ? { ...q, prompt, options: filled } : q,
          ),
        }
      }),
    )
    cancelEdit()
    onToast('Đã cập nhật câu hỏi')
  }

  function deleteQuestion(questionId) {
    onUpdateSubjects(
      subjects.map((s) => {
        if (s.id !== subject.id) return s
        return { ...s, questions: s.questions.filter((q) => q.id !== questionId) }
      }),
    )
    onToast('Đã xóa câu hỏi', 'danger')
  }

  function saveName() {
    const trimmed = nameValue.trim()
    if (!trimmed) return
    onUpdateSubjects(
      subjects.map((s) => (s.id === subject.id ? { ...s, name: trimmed } : s)),
    )
    setEditingName(false)
    onToast('Đã đổi tên môn học')
  }

  // ── Option form (shared between add & edit) ──
  function OptionRows({ opts, onUpdate, onRemove, onAdd }) {
    return (
      <>
        <p className="options-hint">Nhập đáp án và tích vào ô đúng (có thể chọn nhiều)</p>
        <div className="option-rows">
          {opts.map((opt, i) => (
            <div key={i} className={`option-row${opt.correct ? ' is-correct' : ''}`}>
              <label className="option-label">{labelOf(i)}</label>
              <input
                className="option-input"
                value={opt.text}
                onChange={(e) => onUpdate(i, 'text', e.target.value)}
                placeholder={`Đáp án ${labelOf(i)}`}
              />
              <label className="correct-toggle" title="Đáp án đúng">
                <input
                  type="checkbox"
                  checked={opt.correct}
                  onChange={(e) => onUpdate(i, 'correct', e.target.checked)}
                />
                <span className="checkmark" />
              </label>
              {opts.length > 2 && (
                <button
                  type="button"
                  className="btn-remove-option"
                  onClick={() => onRemove(i)}
                  title="Xóa đáp án này"
                >✕</button>
              )}
            </div>
          ))}
        </div>
        <button type="button" className="btn-add-option" onClick={onAdd}>
          + Thêm đáp án
        </button>
      </>
    )
  }

  const totalCount = subject.questions.length

  return (
    <Panel>
      {/* ── Header: back + subject name ── */}
      <div className="editor-header">
        <button type="button" className="btn-back" onClick={onBack}>← Quay lại</button>
        {editingName ? (
          <div className="name-edit-row">
            <input
              className="name-input"
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveName()
                if (e.key === 'Escape') { setEditingName(false); setNameValue(subject.name) }
              }}
              autoFocus
            />
            <button type="button" className="btn-save" onClick={saveName}>Lưu</button>
            <button type="button" className="btn-cancel" onClick={() => { setEditingName(false); setNameValue(subject.name) }}>Hủy</button>
          </div>
        ) : (
          <div className="name-display-row">
            <h2 className="editor-title">{subject.name}</h2>
            <div className="subject-icon-actions">
              <button type="button" className="btn-icon btn-icon-rename" title="Đổi tên" onClick={() => { setNameValue(subject.name); setEditingName(true) }}>✎</button>
              <button
                type="button"
                className="btn-icon btn-icon-delete"
                title="Xóa môn"
                onClick={() => {
                  if (window.confirm(`Xóa môn "${subject.name}"? Hành động này không thể hoàn tác.`)) {
                    onDeleteSubject(subject.id)
                  }
                }}
              >🗑</button>
            </div>
          </div>
        )}
      </div>

      <div className="questions-layout">
        {/* ── Left: tabs + content ── */}
        <div className="questions-list-col">
          {/* mini tab switcher */}
          <div className="list-mode-tabs">
            <button
              type="button"
              className={`list-mode-tab${listMode === 'grid' ? ' active' : ''}`}
              onClick={() => setListMode('grid')}
            >
              Bảng câu
            </button>
            <button
              type="button"
              className={`list-mode-tab${listMode === 'list' ? ' active' : ''}`}
              onClick={() => setListMode('list')}
            >
              Danh sách
            </button>
            <span className="list-mode-count">{totalCount} câu</span>
          </div>

          {/* ── Grid view ── */}
          {listMode === 'grid' && (
            totalCount === 0
              ? <p className="muted">Chưa có câu hỏi nào.</p>
              : <div className="question-index-grid">
                  {subject.questions.map((q, i) => (
                    <button
                      key={q.id}
                      type="button"
                      className={`index-chip${editingId === q.id ? ' is-editing' : ''}`}
                      onClick={() => jumpToQuestion(i)}
                    >
                      <span className="chip-num">{i + 1}</span>
                      <span className="chip-preview">{q.prompt}</span>
                    </button>
                  ))}
                </div>
          )}

          {/* ── List view ── */}
          {listMode === 'list' && (
            <>
              <div className="list-header">
                <span className="list-count">
                  {filteredQuestions.length === totalCount
                    ? `${totalCount} câu`
                    : `${filteredQuestions.length} / ${totalCount} câu`}
                </span>
                <input
                  className="search-input"
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm câu hỏi hoặc đáp án…"
                />
              </div>

              {filteredQuestions.length === 0 ? (
                <p className="muted">{search ? 'Không tìm thấy kết quả.' : 'Chưa có câu hỏi nào.'}</p>
              ) : (
                <div className="question-list" ref={listRef}>
                  {filteredQuestions.map((q) => {
                    const opts = questionToOptions(q)
                    const realIdx = subject.questions.indexOf(q)
                    return (
                      <article key={q.id} data-qidx={realIdx} className="question-item">
                        {editingId === q.id ? (
                          <div className="edit-question">
                            <textarea
                              value={editData.prompt}
                              onChange={(e) => setEditData({ ...editData, prompt: e.target.value })}
                              rows={2}
                              autoFocus
                            />
                            <OptionRows
                              opts={editData.options}
                              onUpdate={updateEditOption}
                              onRemove={removeEditOption}
                              onAdd={addEditOption}
                            />
                            <div className="action-buttons">
                              <button type="button" className="btn-save" onClick={() => saveEdit(q.id)}>Lưu</button>
                              <button type="button" className="btn-cancel" onClick={cancelEdit}>Hủy</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="question-header">
                              <span className="question-num">#{realIdx + 1}</span>
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
          )}
        </div>

        {/* ── Right: add question form ── */}
        <div className="questions-form-col">
          <form className="form stacked" onSubmit={handleSubmit}>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Nội dung câu hỏi"
              rows={3}
              className={duplicateWarning ? 'input-warning' : ''}
            />
            {duplicateWarning && (
              <p className="duplicate-warning">⚠ Câu hỏi này đã tồn tại trong môn học!</p>
            )}

            <OptionRows
              opts={options}
              onUpdate={updateOption}
              onRemove={removeOption}
              onAdd={addOption}
            />

            <button type="submit">Lưu câu hỏi</button>
          </form>
        </div>
      </div>
    </Panel>
  )
}