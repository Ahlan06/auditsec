import { useParams, Link, Navigate } from 'react-router-dom';
import { Clock, ArrowLeft, ChevronRight, BookOpen, Calendar, User } from 'lucide-react';
import { getGuideBySlug, guides, getCategoryById } from '../data/guidesData';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const GuideDetailPage = () => {
  const { slug } = useParams();
  const guide = getGuideBySlug(slug);

  // Redirect if guide not found
  if (!guide) {
    return <Navigate to="/guides" replace />;
  }

  const category = getCategoryById(guide.category);
  
  // Find next guide in same category
  const categoryGuides = guides.filter(g => g.category === guide.category);
  const currentIndex = categoryGuides.findIndex(g => g.id === guide.id);
  const nextGuide = currentIndex < categoryGuides.length - 1 ? categoryGuides[currentIndex + 1] : null;
  const prevGuide = currentIndex > 0 ? categoryGuides[currentIndex - 1] : null;

  const getLevelColor = (level) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'intermediate':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'advanced':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Breadcrumb */}
      <section className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-gray-600 hover:text-[#6b7280] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link to="/guides" className="text-gray-600 hover:text-[#6b7280] transition-colors">
              Guides
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link 
              to="/guides" 
              className="text-gray-600 hover:text-[#6b7280] transition-colors"
            >
              {category?.name}
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium truncate">{guide.title}</span>
          </nav>
        </div>
      </section>

      {/* Article Header */}
      <section className="apple-section pb-0">
        <div className="max-w-4xl mx-auto px-4">
          <Link 
            to="/guides"
            className="inline-flex items-center gap-2 text-[#6b7280] hover:opacity-80 transition-opacity mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Guides
          </Link>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 fade-in">
            {guide.title}
          </h1>

          <p className="text-xl text-gray-600 mb-8 fade-in-up">
            {guide.description}
          </p>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-8 pb-8 border-b border-gray-200 fade-in-up" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{guide.duration} min read</span>
            </div>
            
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span className={`px-2.5 py-0.5 rounded-lg text-xs font-medium border ${getLevelColor(guide.level)}`}>
                {guide.level}
              </span>
            </div>

            {guide.publishedDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(guide.publishedDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
            )}

            {guide.author && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{guide.author}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="apple-section pt-0">
        <div className="max-w-4xl mx-auto px-4">
          <article className="prose prose-lg max-w-none fade-in-up" style={{animationDelay: '0.2s'}}>
            <ReactMarkdown
              components={{
                // Custom heading styling
                h1: (props) => <h1 className="text-4xl font-bold text-gray-900 mt-12 mb-6" {...props} />,
                h2: (props) => <h2 className="text-3xl font-bold text-gray-900 mt-10 mb-4" {...props} />,
                h3: (props) => <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-3" {...props} />,
                h4: (props) => <h4 className="text-xl font-semibold text-gray-900 mt-6 mb-2" {...props} />,
                
                // Paragraph styling
                p: (props) => <p className="text-gray-700 leading-relaxed mb-6" {...props} />,
                
                // List styling
                ul: (props) => <ul className="list-disc list-inside mb-6 space-y-2 text-gray-700" {...props} />,
                ol: (props) => <ol className="list-decimal list-inside mb-6 space-y-2 text-gray-700" {...props} />,
                li: (props) => <li className="leading-relaxed" {...props} />,
                
                // Code block styling
                code({inline, className, children, ...props}) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <div className="my-6 rounded-2xl overflow-hidden shadow-lg">
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{
                          margin: 0,
                          padding: '1.5rem',
                          fontSize: '0.9rem',
                          lineHeight: '1.6'
                        }}
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code className="bg-gray-100 text-[#6b7280] px-2 py-1 rounded text-sm font-mono" {...props}>
                      {children}
                    </code>
                  );
                },
                
                // Blockquote styling (for warnings/notes)
                blockquote: (props) => (
                  <blockquote className="border-l-4 border-[#6b7280] bg-gray-50 p-4 my-6 rounded-r-xl" {...props} />
                ),
                
                // Link styling
                a: (props) => (
                  <a className="text-[#6b7280] hover:underline font-medium" {...props} />
                ),
                
                // Strong/Bold styling
                strong: (props) => <strong className="font-bold text-gray-900" {...props} />,
              }}
            >
              {guide.content}
            </ReactMarkdown>
          </article>

          {/* Tags */}
          {guide.tags && guide.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {guide.tags.map((tag, idx) => (
                  <span 
                    key={idx}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Navigation to Next/Previous Guide */}
      {(prevGuide || nextGuide) && (
        <section className="apple-section bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <div className={`grid ${prevGuide && nextGuide ? 'md:grid-cols-2' : 'grid-cols-1'} gap-6`}>
              {prevGuide && (
                <Link 
                  to={`/guides/${prevGuide.slug}`}
                  className="apple-card p-6 hover:shadow-lg transition-all group"
                >
                  <div className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Previous Guide
                  </div>
                  <h4 className="font-semibold text-gray-900 group-hover:text-[#6b7280] transition-colors">
                    {prevGuide.title}
                  </h4>
                </Link>
              )}

              {nextGuide && (
                <Link 
                  to={`/guides/${nextGuide.slug}`}
                  className="apple-card p-6 hover:shadow-lg transition-all group"
                >
                  <div className="text-sm text-gray-600 mb-2 flex items-center justify-end gap-2">
                    Next Guide
                    <ChevronRight className="w-4 h-4" />
                  </div>
                  <h4 className="font-semibold text-gray-900 text-right group-hover:text-[#6b7280] transition-colors">
                    {nextGuide.title}
                  </h4>
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Related Resources */}
      <section className="apple-section">
        <div className="max-w-4xl mx-auto px-4">
          <div className="apple-card p-8 text-center bg-gradient-to-br from-blue-50 to-purple-50">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Found this guide helpful?
            </h3>
            <p className="text-gray-600 mb-6">
              Explore more guides in the {category?.name} category or browse all available resources.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link 
                to="/guides"
                className="apple-button"
              >
                Browse All Guides
              </Link>
              <Link 
                to="/contact"
                className="apple-button-secondary"
              >
                Get Support
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="spacer"></div>
    </div>
  );
};

export default GuideDetailPage;
