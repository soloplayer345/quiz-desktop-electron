import './Hero.scss'

export default function Hero({ theme, onToggleTheme }) {
  return (
    <section className="hero">
      <button
        className="theme-toggle"
        onClick={onToggleTheme}
        aria-label={theme === 'dark' ? 'Chuyển sang sáng' : 'Chuyển sang tối'}
        title={theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
      <p className="eyebrow">Quiz Desktop • Electron + React</p>
      <h1>Ôn bài nhanh với bộ câu hỏi trộn ngẫu nhiên</h1>
      <p className="lead">
        Tạo môn học, nhập câu hỏi và đáp án, sau đó vào chế độ ôn bài để làm trắc
        nghiệm ngay. Ứng dụng chạy local, không cần đăng nhập.
      </p>
    </section>
  )
}
