import { useEffect, useState } from 'react'
import Hero from './components/Hero/Hero'
import Tabs from './components/Tabs/Tabs'
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
  const [tab, setTab] = useState('subjects')
  const [toasts, setToasts] = useState([])
  const [updateState, setUpdateState] = useState(null) // 'available' | 'ready'
  const [downloadProgress, setDownloadProgress] = useState(null)

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

  return (
    <main className="page">
      <Hero />
      <Tabs active={tab} onChange={setTab} />

      {tab === 'subjects' && (
        <SubjectsPanel subjects={subjects} onUpdateSubjects={updateSubjects} onToast={showToast} />
      )}
      {tab === 'questions' && (
        <QuestionsPanel subjects={subjects} onUpdateSubjects={updateSubjects} onToast={showToast} />
      )}
      {tab === 'study' && (
        <StudyPanel subjects={subjects} />
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
