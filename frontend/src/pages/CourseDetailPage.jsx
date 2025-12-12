import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { guides } from '../data/guidesData'
import { getCourseProgress, toggleCourseCompleted } from '../utils/progress'
import CourseTOC from '../components/CourseTOC'
import { setCoursePercent, getCoursePercent } from '../utils/progress'

// simple slug generator used for heading ids
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\n+\w\s-]/g, '')
    .replace(/\s+/g, '-')
}

export default function CourseDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [completed, setCompleted] = useState(false)
  const [percent, setPercent] = useState(0)
  const [sections, setSections] = useState([])

  useEffect(() => {
    const c = guides.find((g) => g.slug === slug)
    if (!c) return setCourse(null)
    setCourse(c)
    setCompleted(getCourseProgress(c.id)?.completed || false)
    setPercent(getCoursePercent(c.id) || 0)
    // extract H2 headings as module thumbnails
    const matches = (c.content || '').match(/^##\s+(.*)$/gm)
    const secs = (matches || []).map(m => m.replace(/^##\s+/, '').trim())
    setSections(secs)
  }, [slug])

  if (course === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Course not found</h2>
          <p className="mt-2">The requested course does not exist or was removed.</p>
          <div className="mt-4">
            <Link to="/courses" className="text-blue-600">Back to courses</Link>
          </div>
        </div>
      </div>
    )
  }

  const idx = guides.findIndex((g) => g.id === course.id)
  const prev = guides[(idx - 1 + guides.length) % guides.length]
  const next = guides[(idx + 1) % guides.length]

  function onToggleComplete() {
    toggleCourseCompleted(course.id)
    setCompleted((s) => !s)
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 bg-white apple-card flex flex-col lg:flex-row gap-6 p-6 items-start">
          <div className="flex-1">
            <h1 className="section-title">{course.title}</h1>
            <div className="text-sm text-gray-500 mt-1">{course.author} • {course.publishedDate} • {course.readTime} min</div>
            <div className="mt-4">
              <span className={`course-badge ${course.category === 'getting-started' ? 'badge-blue' : 'badge-purple'}`}>{course.level}</span>
            </div>
            {sections.length > 0 && (
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {sections.map((s, i) => (
                  <button key={i} onClick={() => {
                    const id = slugify(s)
                    const el = document.getElementById(id)
                    if (el) el.scrollIntoView({behavior: 'smooth', block: 'start'})
                  }} className="module-thumb bg-gray-50 dark:bg-gray-900 p-3 rounded-lg flex items-center gap-3 text-sm">
                    <img src="/course-icons/module.svg" alt="" className="w-8 h-8" />
                    <span className="truncate">{s}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="text-right">
              <div className="mb-3">
                <button onClick={onToggleComplete} className={`apple-button ${completed ? 'bg-green-600' : ''}`}>
                  {completed ? 'Completed' : 'Mark complete'}
                </button>
              </div>
              <div className="text-sm text-gray-500">Local progress</div>
              <div className="mt-2 progress-track"><div className="progress-fill" style={{width: completed ? '100%' : `${percent}%`}} /></div>
              <div className="mt-4 flex gap-2 justify-end">
                <button onClick={() => navigate(`/courses/${prev.slug}`)} className="apple-button-secondary">Previous</button>
                <button onClick={() => navigate(`/courses/${next.slug}`)} className="apple-button">Next</button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <main className="col-span-1 lg:col-span-3 relative">
            <div className="prose-container bg-white apple-card p-8">
              <div className="course-detail-main max-w-3xl mx-auto prose prose-slate">
              <ReactMarkdown
                components={{
                  h2: (props) => {
                    const text = String(props.children).replace(/\n/g, '')
                    const id = slugify(text)
                    return <h2 id={id} {...props} />
                  },
                  h3: (props) => {
                    const text = String(props.children).replace(/\n/g, '')
                    const id = slugify(text)
                    return <h3 id={id} {...props} />
                  }
                }}
              >
                {course.content}
              </ReactMarkdown>
              </div>
            </div>
            {/* Vertical progress indicator */}
            <div className="hidden lg:block absolute left-0 top-40 h-[60%] w-1">
              <div className="h-full bg-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gradient-to-b from-sky-400 to-blue-600" style={{height: `${percent}%`}} />
              </div>
            </div>
          </main>
          <aside className="col-span-1">
            <CourseTOC content={course.content} courseId={course.id} onProgress={(p) => { setPercent(p); setCoursePercent(course.id, p) }} />
          </aside>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <Link to="/courses" className="text-gray-600">← Back to courses</Link>
          <div className="text-sm text-gray-500">Last updated: {course.publishedDate}</div>
        </div>
      </div>
    </div>
  )
}
