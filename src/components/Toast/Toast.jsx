import './Toast.scss'

const ICONS = {
  success: '✓',
  danger: '✕',
  info: 'i',
}

export default function Toast({ toasts }) {
  if (!toasts.length) return null

  return (
    <div className="toast-stack" aria-live="polite" aria-atomic="false">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.type ?? 'success'}`}>
          <span className="toast__icon">{ICONS[t.type ?? 'success']}</span>
          <span className="toast__msg">{t.message}</span>
        </div>
      ))}
    </div>
  )
}
