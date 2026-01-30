import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { guides } from '../data/guidesData'

export default function CourseMockPage() {
  const sampleGuides = guides.slice(0, 6)
  const [selected, setSelected] = useState(sampleGuides[0])

  const onSelect = (g) => setSelected(g)
  const onNext = () => {
    const idx = sampleGuides.findIndex((s) => s.id === selected.id)
    const next = sampleGuides[(idx + 1) % sampleGuides.length]
    setSelected(next)
  }
  const onPrev = () => {
    const idx = sampleGuides.findIndex((s) => s.id === selected.id)
    const prev = sampleGuides[(idx - 1 + sampleGuides.length) % sampleGuides.length]
    setSelected(prev)
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold">Available Courses — Prototype</h1>
          <p className="text-gray-600 mt-2">Click a card to open the course and read the content.</p>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {sampleGuides.map((g) => (
            <article
              key={g.id}
              onClick={() => onSelect(g)}
              className={`p-6 rounded-xl shadow-sm border cursor-pointer transition hover:shadow-lg ${selected.id === g.id ? 'ring-2 ring-blue-400' : ''}`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{g.title}</h3>
                <span className="text-sm text-gray-500">{g.duration} min</span>
              </div>
              <p className="text-gray-600 mt-2">{g.description}</p>
                <div className="mt-4 flex items-center justify-between">
                <span className="px-2 py-1 bg-gray-100 text-sm rounded">{g.level}</span>
                <button className="text-blue-600 text-sm">Read</button>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-10 bg-gray-50 rounded-lg p-6 shadow">
          <div className="flex items-start gap-6">
            <div className="w-full lg:w-3/4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{selected.title}</h2>
                  <div className="text-sm text-gray-500 mt-1">{selected.author} • {selected.publishedDate} • {selected.readTime} min</div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={onPrev} className="px-3 py-2 bg-white border rounded">Previous</button>
                  <button onClick={onNext} className="px-3 py-2 bg-blue-600 text-white rounded">Next</button>
                </div>
              </div>

              <article className="prose prose-slate max-w-none mt-6">
                <ReactMarkdown>{selected.content}</ReactMarkdown>
              </article>
            </div>

            <aside className="hidden lg:block w-1/4">
              <div className="p-4 bg-white rounded border shadow-sm">
                <h4 className="font-semibold mb-2">Table of Contents (preview)</h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  {/* Simple TOC mock - show first headings from content */}
                  {selected.content.split('\n').filter(line => line.startsWith('# ')).slice(0,6).map((line, idx) => (
                    <li key={idx} className="truncate">{line.replace('# ', '')}</li>
                  ))}
                </ul>

                <div className="mt-4">
                  <button className="w-full px-3 py-2 bg-green-600 text-white rounded">Start Course</button>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </div>
  )
}
