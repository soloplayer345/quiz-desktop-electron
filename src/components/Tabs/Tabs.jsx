import './Tabs.scss'

const TAB_LIST = [
  { key: 'subjects', label: 'Môn học' },
  { key: 'questions', label: 'Câu hỏi' },
  { key: 'study', label: 'Ôn bài' },
]

export default function Tabs({ active, onChange }) {
  return (
    <section className="tabs">
      {TAB_LIST.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          className={active === key ? 'tab active' : 'tab'}
          onClick={() => onChange(key)}
        >
          {label}
        </button>
      ))}
    </section>
  )
}
