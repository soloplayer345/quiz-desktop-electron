import { useEffect, useState } from 'react'
import Hero from './components/Hero/Hero'
import Toast from './components/Toast/Toast'
import UpdateBanner from './components/UpdateBanner/UpdateBanner'
import SubjectsPanel from './modules/subjects/SubjectsPanel'
import QuestionsPanel from './modules/questions/QuestionsPanel'
import StudyPanel from './modules/study/StudyPanel'
import { loadSubjectsAsync, saveSubjects } from './utils/storage'
import { makeId } from './utils/helpers'
import './App.scss'

const TOAST_DURATION = 2600

function App() {
  const [subjects, setSubjects] = useState([])
  const [view, setView] = useState('subjects') // 'subjects' | 'edit' | 'study'
  const [selectedSubjectId, setSelectedSubjectId] = useState(null)
  const [toasts, setToasts] = useState([])
  const [updateState, setUpdateState] = useState(null) // 'available' | 'ready'
  const [downloadProgress, setDownloadProgress] = useState(null)
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') ?? 'light'
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('theme', theme)
  }, [theme])

  function toggleTheme() {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }

  useEffect(() => {
    loadSubjectsAsync().then(setSubjects)
  }, [])

  useEffect(() => {
    if (!window.updater) return
    window.updater.onUpdateAvailable(() => setUpdateState('available'))
    window.updater.onDownloadProgress((p) => setDownloadProgress(p.percent))
    window.updater.onUpdateDownloaded(() => {
      setUpdateState('ready')
      setDownloadProgress(null)
    })
  }, [])

  function showToast(message, type = 'success') {
    const id = makeId('toast')
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, TOAST_DURATION)
  }

  function updateSubjects(nextSubjects) {
    setSubjects(nextSubjects)
    saveSubjects(nextSubjects)
  }

  function goToEdit(subjectId) {
    setSelectedSubjectId(subjectId)
    setView('edit')
  }

  function goToStudy(subjectId) {
    setSelectedSubjectId(subjectId)
    setView('study')
  }

  function goBack() {
    setView('subjects')
    setSelectedSubjectId(null)
  }

  function deleteSubject(subjectId) {
    updateSubjects(subjects.filter((s) => s.id !== subjectId))
    goBack()
    showToast('Đã xóa môn học', 'danger')
  }

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId) ?? null

  return (
    <main className="page">
      <Hero theme={theme} onToggleTheme={toggleTheme} />

      {view === 'subjects' && (
        <SubjectsPanel
          subjects={subjects}
          onUpdateSubjects={updateSubjects}
          onToast={showToast}
          onEdit={goToEdit}
          onStudy={goToStudy}
        />
      )}
      {view === 'edit' && selectedSubject && (
        <QuestionsPanel
          subject={selectedSubject}
          subjects={subjects}
          onUpdateSubjects={updateSubjects}
          onToast={showToast}
          onBack={goBack}
          onDeleteSubject={deleteSubject}
        />
      )}
      {view === 'study' && selectedSubject && (
        <StudyPanel
          subject={selectedSubject}
          onBack={goBack}
        />
      )}

      <Toast toasts={toasts} />
      <UpdateBanner
        state={updateState}
        progress={downloadProgress}
        onInstall={() => window.updater?.install()}
      />
    </main>
  )
}

export default App
