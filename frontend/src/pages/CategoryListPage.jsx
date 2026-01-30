import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { getCategoryById, getGuidesByCategory } from '../data/guidesData';
import GuideCardLarge from '../components/GuideCardLarge';
import { Shield, Book, Target, Wrench } from 'lucide-react';

const CategoryListPage = () => {
  const { categoryId } = useParams();
  
  console.log('CategoryListPage rendered!', categoryId);
  
  const category = getCategoryById(categoryId);
  const guides = getGuidesByCategory(categoryId);

  console.log('Category:', category);
  console.log('Guides:', guides);

  // Redirect if category not found
  if (!category) {
    console.log('Category not found, redirecting...');
    return <Navigate to="/guides" replace />;
  }

  // Icon mapping
  const iconMap = {
    Shield: Shield,
    Book: Book,
    Target: Target,
    Wrench: Wrench
  };

  const CategoryIcon = ({ iconName, className }) => {
    const Icon = iconMap[iconName] || Shield;
    return <Icon className={className} />;
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Breadcrumb */}
      <section className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm">
               <Link to="/" className="text-gray-600 hover:text-[#6b7280] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
               <Link to="/guides" className="text-gray-600 hover:text-[#6b7280] transition-colors">
              Guides
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium">{category.name}</span>
          </nav>
        </div>
      </section>

      {/* Header Section */}
      <section className="apple-section pb-0">
        <div className="max-w-6xl mx-auto px-4">
          <Link 
            to="/guides"
            className="inline-flex items-center gap-2 text-[#6b7280] hover:opacity-80 transition-opacity mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to All Categories
          </Link>

          {/* Category Header with Icon */}
          <div className="flex items-start gap-6 mb-8">
            <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${category.color} rounded-3xl flex-shrink-0 shadow-lg fade-in`}>
              <CategoryIcon iconName={category.icon} className="w-10 h-10 text-white" />
            </div>
            
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 fade-in">
                {category.name}
              </h1>
              <p className="text-xl text-gray-600 fade-in-up" style={{animationDelay: '0.1s'}}>
                {category.description}
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-8 py-6 border-y border-gray-200 text-sm text-gray-600 fade-in-up" style={{animationDelay: '0.2s'}}>
            <div>
              <span className="font-bold text-2xl text-gray-900">{guides.length}</span>
              <span className="ml-2">Guides</span>
            </div>
            <div>
              <span className="font-bold text-2xl text-gray-900">
                {guides.reduce((sum, guide) => sum + guide.duration, 0)}
              </span>
              <span className="ml-2">Minutes of Content</span>
            </div>
            <div>
              <span className="font-bold text-2xl text-gray-900">
                {guides.filter(g => g.level === 'Beginner').length}
              </span>
              <span className="ml-2">Beginner Friendly</span>
            </div>
          </div>
        </div>
      </section>

      {/* Guides List */}
      <section className="apple-section">
        <div className="max-w-6xl mx-auto px-4">
          {guides.length > 0 ? (
            <div className="space-y-6">
              {guides.map((guide, idx) => (
                <div 
                  key={guide.id}
                  className="fade-in-up"
                  style={{animationDelay: `${idx * 0.1}s`}}
                >
                  <GuideCardLarge guide={guide} />
                </div>
              ))}
            </div>
          ) : (
            <div className="apple-card p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Book className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Guides Yet
              </h3>
              <p className="text-gray-600 mb-6">
                We're working on adding guides to this category. Check back soon!
              </p>
              <Link 
                to="/guides"
                className="apple-button inline-flex"
              >
                Browse Other Categories
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Learning Tips Section */}
      {guides.length > 0 && (
        <section className="apple-section bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="apple-card p-10 bg-gradient-to-br from-blue-50 to-purple-50">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                How to Get the Most from These Guides
              </h3>
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                     <div className="w-12 h-12 bg-[#6b7280] text-white rounded-xl flex items-center justify-center text-xl font-bold mx-auto mb-3">
                    1
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Read in Order</h4>
                  <p className="text-sm text-gray-600">
                    Follow the guides sequentially to build a strong foundation
                  </p>
                </div>
                <div className="text-center">
                     <div className="w-12 h-12 bg-[#6b7280] text-white rounded-xl flex items-center justify-center text-xl font-bold mx-auto mb-3">
                    2
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Practice Hands-On</h4>
                  <p className="text-sm text-gray-600">
                    Apply concepts in your lab environment as you learn
                  </p>
                </div>
                <div className="text-center">
                     <div className="w-12 h-12 bg-[#6b7280] text-white rounded-xl flex items-center justify-center text-xl font-bold mx-auto mb-3">
                    3
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Take Notes</h4>
                  <p className="text-sm text-gray-600">
                    Document your learning journey and key takeaways
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="apple-section">
        <div className="max-w-6xl mx-auto px-4">
          <div className="apple-card p-10 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Need Help with These Topics?
            </h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Our team is here to support your learning journey. Get in touch for personalized guidance and support.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link 
                to="/contact"
                className="apple-button"
              >
                Contact Support
              </Link>
              <Link 
                to="/guides"
                className="apple-button-secondary"
              >
                Explore More Categories
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="spacer"></div>
    </div>
  );
};

export default CategoryListPage;
