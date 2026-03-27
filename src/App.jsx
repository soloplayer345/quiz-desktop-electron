import { useState } from 'react'
import Hero from './components/Hero/Hero'
import Tabs from './components/Tabs/Tabs'
import SubjectsPanel from './modules/subjects/SubjectsPanel'
import QuestionsPanel from './modules/questions/QuestionsPanel'
import StudyPanel from './modules/study/StudyPanel'
import { loadSubjects, saveSubjects } from './utils/storage'
import './App.scss'

function App() {
  const [subjects, setSubjects] = useState(loadSubjects)
  const [tab, setTab] = useState('subjects')

  function updateSubjects(nextSubjects) {
    setSubjects(nextSubjects)
    saveSubjects(nextSubjects)
  }

  return (
    <main className="page">
      <Hero />
      <Tabs active={tab} onChange={setTab} />

      {tab === 'subjects' && (
        <SubjectsPanel subjects={subjects} onUpdateSubjects={updateSubjects} />
      )}
      {tab === 'questions' && (
        <QuestionsPanel subjects={subjects} onUpdateSubjects={updateSubjects} />
      )}
      {tab === 'study' && (
        <StudyPanel subjects={subjects} />
      )}
    </main>
  )
}

export default App
