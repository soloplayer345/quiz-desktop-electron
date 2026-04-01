import { useMemo, useState } from 'react'
import Panel from '../../components/Panel/Panel'
import { shuffle } from '../../utils/helpers'
import './StudyPanel.scss'

// Backward-compat: build options array regardless of old vs new format
function buildOptions(q) {
  if (q.options) {
    return shuffle(
      q.options.map((o, i) => ({ ...o, label: String.fromCharCode(65 + i) }))
    )
  }
  return shuffle([
    { label: 'A', text: q.correct, correct: true },
    ...(q.wrong ?? []).map((w, i) => ({ label: String.fromCharCode(66 + i), text: w, correct: false })),
  ])
}

export default function StudyPanel({ subject, onBack }) {
  const [session, setSession] = useState(null)

  const currentQuestion = session
    ? session.questions[session.index]
    : null

  const currentAnswer = session
    ? session.answers.find((a) => a.questionId === currentQuestion?.id)
    : null

  // For multi-correct: track pending selections before submitting
  const [pendingSelection, setPendingSelection] = useState([])

  function startStudy() {
    if (!subject || subject.questions.length === 0) {
      return
    }

    const preparedQuestions = shuffle(subject.questions).map((q) => {
      const options = buildOptions(q)
      const isMulti = options.filter((o) => o.correct).length > 1

      return {
        id: q.id,
        prompt: q.prompt,
        options,
        isMulti,
      }
    })

    setSession({
      questions: preparedQuestions,
      index: 0,
      score: 0,
      answers: [],
    })
    setPendingSelection([])
  }

  function togglePending(optionLabel) {
    if (currentAnswer) return
    setPendingSelection((prev) =>
      prev.includes(optionLabel)
        ? prev.filter((l) => l !== optionLabel)
        : [...prev, optionLabel],
    )
  }

  function submitAnswer() {
    if (!session || !currentQuestion || currentAnswer || pendingSelection.length === 0) return

    const correctLabels = currentQuestion.options.filter((o) => o.correct).map((o) => o.label).sort()
    const selectedLabels = [...pendingSelection].sort()
    const isCorrect =
      correctLabels.length === selectedLabels.length &&
      correctLabels.every((l, i) => l === selectedLabels[i])

    setSession({
      ...session,
      score: session.score + (isCorrect ? 1 : 0),
      answers: [
        ...session.answers,
        { questionId: currentQuestion.id, selected: pendingSelection, isCorrect },
      ],
    })
  }

  // Single-correct: auto-submit on click
  function chooseAnswer(optionLabel) {
    if (!session || !currentQuestion || currentAnswer) return

    const correctLabels = currentQuestion.options.filter((o) => o.correct).map((o) => o.label)
    const isCorrect = correctLabels.length === 1 && correctLabels[0] === optionLabel

    setSession({
      ...session,
      score: session.score + (isCorrect ? 1 : 0),
      answers: [
        ...session.answers,
        { questionId: currentQuestion.id, selected: [optionLabel], isCorrect },
      ],
    })
  }

  function nextQuestion() {
    if (!session) {
      return
    }

    setPendingSelection([])

    if (session.index >= session.questions.length - 1) {
      setSession({ ...session, done: true })
      return
    }

    setSession({ ...session, index: session.index + 1 })
  }

  function resetStudy() {
    setSession(null)
    setPendingSelection([])
  }

  return (
    <Panel title={`Ôn bài: ${subject.name}`}>
      {!session && (
        <>
          <div className="form">
            <p className="muted">
              Có {subject.questions.length} câu hỏi sẽ được trộn ngẫu nhiên.
            </p>
            <button type="button" onClick={startStudy} disabled={subject.questions.length === 0}>
              Bắt đầu ôn
            </button>
          </div>
          <button type="button" className="btn-back" onClick={onBack}>← Quay lại</button>
        </>
      )}

      {session && currentQuestion && !session.done && (
        <article className="quiz-card">
          <div className="quiz-card-header">
            <p className="progress">
              Câu {session.index + 1}/{session.questions.length}
            </p>
            <button type="button" className="btn-back" onClick={onBack}>← Quay lại</button>
          </div>
          <h3>{currentQuestion.prompt}</h3>

          {currentQuestion.isMulti && !currentAnswer && (
            <p className="multi-hint">Câu này có nhiều đáp án đúng — chọn tất cả rồi bấm Xác nhận</p>
          )}

          <div className="options">
            {currentQuestion.options.map((option) => {
              const isSelected = currentAnswer
                ? currentAnswer.selected.includes(option.label)
                : pendingSelection.includes(option.label)
              const revealedCorrect = currentAnswer && option.correct
              const revealedWrong = currentAnswer && isSelected && !option.correct

              let cls = 'option'
              if (revealedCorrect) cls += ' correct'
              else if (revealedWrong) cls += ' wrong'
              else if (isSelected) cls += ' selected'

              if (currentQuestion.isMulti) {
                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => togglePending(option.label)}
                    disabled={Boolean(currentAnswer)}
                    className={cls}
                  >
                    <span className="opt-letter">{option.label}</span> {option.text}
                  </button>
                )
              }

              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => chooseAnswer(option.label)}
                  disabled={Boolean(currentAnswer)}
                  className={cls}
                >
                  <span className="opt-letter">{option.label}</span> {option.text}
                </button>
              )
            })}
          </div>

          {currentQuestion.isMulti && !currentAnswer && (
            <button
              type="button"
              className="btn-confirm"
              disabled={pendingSelection.length === 0}
              onClick={submitAnswer}
            >
              Xác nhận
            </button>
          )}

          {currentAnswer && (
            <div className="result-row">
              <p>{currentAnswer.isCorrect ? 'Chính xác!' : 'Chưa đúng, xem đáp án và thử câu tiếp theo.'}</p>
              <button type="button" onClick={nextQuestion}>
                {session.index === session.questions.length - 1
                  ? 'Xem kết quả'
                  : 'Câu tiếp theo'}
              </button>
            </div>
          )}
        </article>
      )}

      {session?.done && (
        <article className="quiz-card done">
          <h3>Hoàn thành lượt ôn</h3>
          <p>
            Bạn đúng <strong>{session.score}</strong> /{' '}
            <strong>{session.questions.length}</strong> câu.
          </p>
          <p>
            Tỷ lệ đúng:{' '}
            <strong>
              {Math.round((session.score / session.questions.length) * 100)}%
            </strong>
          </p>
          <div className="done-actions">
            <button type="button" onClick={resetStudy}>
              Ôn lại từ đầu
            </button>
            <button type="button" className="btn-back" onClick={onBack}>← Quay lại</button>
          </div>
        </article>
      )}
    </Panel>
  )
}
