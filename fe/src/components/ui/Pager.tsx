import './Pager.css'

interface PagerProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
  label: string
}

export default function Pager({ page, totalPages, onChange, label }: PagerProps) {
  // Prima, ultima e le due vicine alla corrente; il resto diventa "…".
  const shown = [...Array(totalPages).keys()].filter((p) => p === 0 || p === totalPages - 1 || Math.abs(p - page) <= 1)

  return (
    <nav className="cs-pager" aria-label={label}>
      <button type="button" onClick={() => onChange(page - 1)} disabled={page === 0} aria-label="Pagina precedente">
        ◀
      </button>
      {shown.map((p, index) => (
        <span key={p} className="cs-pager__slot">
          {index > 0 && p - shown[index - 1] > 1 && <span className="cs-pager__gap">…</span>}
          <button type="button" onClick={() => onChange(p)} aria-current={p === page ? 'page' : undefined}>
            {p + 1}
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages - 1}
        aria-label="Pagina successiva"
      >
        ▶
      </button>
    </nav>
  )
}
