import { Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const GuideCard = ({ guide }) => {
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
      <div className="bg-gray-50 hover:bg-white rounded-2xl p-6 transition-all duration-300 border-2 border-transparent hover:border-gray-200 hover:shadow-lg cursor-pointer">
        {/* Title */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900 group-hover:text-[#6b7280] transition-colors pr-2">
            {guide.title}
          </h3>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#6b7280] group-hover:translate-x-1 transition-all flex-shrink-0 mt-0.5" />
        </div>

        {/* Meta Info */}
        <div className="flex items-center gap-3 text-sm">
          {/* Duration */}
          <div className="flex items-center gap-1.5 text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{guide.duration} min</span>
          </div>

          {/* Level Badge */}
          <span className={`px-2.5 py-0.5 rounded-lg text-xs font-medium border ${getLevelColor(guide.level)}`}>
            {guide.level}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default GuideCard;
