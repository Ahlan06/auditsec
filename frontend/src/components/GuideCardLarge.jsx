import { Clock, ChevronRight, Calendar, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const GuideCardLarge = ({ guide }) => {
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
    <Link 
      to={`/guide/${guide.slug}`}
      className="group block"
    >
      <div className="apple-card p-8 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-[#6b7280]">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-2xl font-semibold text-gray-900 group-hover:text-[#6b7280] transition-colors mb-3">
              {guide.title}
            </h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              {guide.description}
            </p>
          </div>
          <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-[#6b7280] group-hover:translate-x-2 transition-all flex-shrink-0 ml-4 mt-1" />
        </div>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
          {/* Duration */}
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{guide.duration} min read</span>
          </div>

          {/* Level Badge */}
          <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${getLevelColor(guide.level)}`}>
            {guide.level}
          </span>

          {/* Published Date */}
          {guide.publishedDate && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{new Date(guide.publishedDate).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })}</span>
            </div>
          )}

          {/* Author */}
          {guide.author && (
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span>{guide.author}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {guide.tags && guide.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
            {guide.tags.slice(0, 4).map((tag, idx) => (
              <span 
                key={idx}
                className="px-2.5 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs hover:bg-gray-100 transition-colors"
              >
                #{tag}
              </span>
            ))}
            {guide.tags.length > 4 && (
              <span className="px-2.5 py-1 text-gray-400 text-xs">
                +{guide.tags.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};

export default GuideCardLarge;
