import React, { useMemo, useEffect, useState } from 'react'

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[`~!@#$%^&*()+=,.?/\\{}\[\]:;"'<>|]/g, '')
    .replace(/\s+/g, '-')
}

export default function CourseTOC({ content, courseId, onProgress }) {
  const [activeId, setActiveId] = useState(null)

  const headings = useMemo(() => {
    if (!content) return []
    const lines = content.split('\n')
    const result = []
    for (let line of lines) {
      const h2 = line.match(/^##\s+(.*)/)
      const h3 = line.match(/^###\s+(.*)/)
      if (h2) {
        const text = h2[1].trim()
        result.push({ level: 2, text, id: slugify(text) })
      } else if (h3) {
        const text = h3[1].trim()
        result.push({ level: 3, text, id: slugify(text) })
      }
    }
    return result
  }, [content])

  function goTo(id) {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // use IntersectionObserver for robust detection
  useEffect(() => {
    if (!headings.length) return
    const elems = headings.map(h => document.getElementById(h.id)).filter(Boolean)
    if (!elems.length) return

    const observer = new IntersectionObserver((entries) => {
      // choose entry with largest intersectionRatio
      let best = null
      entries.forEach(e => {
        if (!best || e.intersectionRatio > best.intersectionRatio) best = e
      })
      if (best && best.target && best.target.id) {
        setActiveId(best.target.id)
        const idx = headings.findIndex(h => h.id === best.target.id)
        const percent = headings.length > 0 ? Math.round(((idx + 1) / headings.length) * 100) : 100
        if (onProgress) onProgress(percent)
        // store locally if courseId provided
        // (avoid importing progress util here to keep component focused)
      }
    }, { root: null, rootMargin: '0px 0px -60% 0px', threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] })

    elems.forEach(el => observer.observe(el))
    // call initially to set state
    elems.forEach(el => {
      const r = el.getBoundingClientRect()
      if (r.top >= 0) {
        // noop just to ensure elements exist
      }
    })

    return () => observer.disconnect()
  }, [headings, onProgress, courseId])

  if (!headings.length) return (
    <div className="p-4 bg-white rounded border shadow-sm course-toc">
      <h4 className="font-semibold mb-2">Table of Contents</h4>
      <div className="text-sm text-gray-500">No sections detected</div>
    </div>
  )

  return (
    <nav className="p-4 bg-white rounded border shadow-sm sticky top-6 course-toc">
      <h4 className="font-semibold mb-3">Table of Contents</h4>
      <ul className="space-y-2 text-sm">
        {headings.map((h) => (
          <li key={h.id} className={`truncate ${h.level === 3 ? 'pl-4' : ''}`}>
            <button
              onClick={() => goTo(h.id)}
              className={`text-left w-full apple-link ${activeId === h.id ? 'course-toc-item-active' : ''}`}
            >
              {h.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
