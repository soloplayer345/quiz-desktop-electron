import './UpdateBanner.scss'

export default function UpdateBanner({ state, progress, onInstall }) {
  if (!state) return null

  if (state === 'available') {
    return (
      <div className="update-banner update-banner--info">
        <span className="update-banner__icon">↓</span>
        <span className="update-banner__msg">Đang tải bản cập nhật mới…</span>
        {progress != null && (
          <span className="update-banner__progress">{Math.round(progress)}%</span>
        )}
      </div>
    )
  }

  if (state === 'ready') {
    return (
      <div className="update-banner update-banner--ready">
        <span className="update-banner__icon">✓</span>
        <span className="update-banner__msg">Bản cập nhật đã sẵn sàng!</span>
        <button className="update-banner__btn" onClick={onInstall}>
          Khởi động lại để cập nhật
        </button>
      </div>
    )
  }

  return null
}
