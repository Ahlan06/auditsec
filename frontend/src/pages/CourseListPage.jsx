import React from 'react'
import { Link } from 'react-router-dom'
import { guides } from '../data/guidesData'
import { getCoursePercent } from '../utils/progress'

export default function CourseListPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="course-hero">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <h1 className="hero-title">Available Courses</h1>
              <p className="hero-subtitle mt-3">Browse our courses and learn cybersecurity fundamentals for free.</p>
            </div>
            <div className="hidden md:block text-right">
              <div className="text-sm text-gray-500">Over <strong>{guides.length}</strong> courses available</div>
            </div>
          </div>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.map((g) => (
            <article key={g.id} className="course-card-hero p-6 bg-white border product-card animated-card">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <h3 className="card-title text-lg">
                    <Link to={`/courses/${g.slug}`} className="apple-link">{g.title}</Link>
                  </h3>
                  <p className="text-gray-600 mt-2 text-sm">{g.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">{g.duration} min</div>
                  <div className="mt-2">
                    <span className={`course-badge ${g.category === 'getting-started' ? 'badge-blue' : 'badge-purple'}`}>{g.level}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <Link to={`/courses/${g.slug}`} className="apple-button">View course</Link>
                <div className="w-1/3">
                    <div className="progress-track relative">
                      <div className="progress-fill" style={{width: `${getCoursePercent(g.id) || 0}%`}} />
                      <div className="progress-label">{getCoursePercent(g.id) || 0}%</div>
                    </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  )
}
