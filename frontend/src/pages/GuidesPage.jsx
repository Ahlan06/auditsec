import { Shield, Book, Target, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GuideCard from '../components/GuideCard';
import { guidesCategories, guides, getGuidesByCategory } from '../data/guidesData';

const GuidesPage = () => {
  const navigate = useNavigate();
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
      {/* Hero Section */}
      <section className="apple-section pb-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="hero-title mb-6 fade-in">
            Master Cybersecurity Skills
          </h1>
          <p className="hero-subtitle mb-0 fade-in-up max-w-3xl mx-auto" style={{animationDelay: '0.1s'}}>
            Comprehensive guides and tutorials to help you become a skilled penetration tester. 
            From beginner fundamentals to advanced techniques.
          </p>
        </div>
      </section>

      {/* Browse by Category Section */}
      <section className="apple-section pt-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="section-title text-center mb-12">Browse by Category</h2>
          <p className="text-center text-gray-600 mb-12 -mt-8">
            Choose from our organized collection of guides tailored to your learning needs
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {guidesCategories.map((category, idx) => {
              const categoryGuides = getGuidesByCategory(category.id);
              
              return (
                <div 
                  key={category.id}
                  className="fade-in-up"
                  style={{animationDelay: `${idx * 0.1}s`, position: 'relative', isolation: 'isolate'}}
                >
                  <div className="apple-card p-8 mb-4" style={{ pointerEvents: 'auto' }}>
                    {/* Category Header */}
                    <div className="flex items-start gap-4 mb-6">
                      <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${category.color} rounded-2xl flex-shrink-0`}>
                        <CategoryIcon iconName={category.icon} className="w-7 h-7 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {category.description}
                        </p>
                      </div>
                    </div>

                    {/* Guides List */}
                    <div className="space-y-3" style={{ pointerEvents: 'auto' }}>
                      {categoryGuides.slice(0, 3).map((guide) => (
                        <GuideCard key={guide.id} guide={guide} />
                      ))}
                    </div>
                  </div>

                  {/* View All Button - OUTSIDE the card */}
                  {categoryGuides.length > 0 && (
                    <div 
                      onClick={() => navigate(`/category/${category.id}`)}
                      className="block w-full py-3 px-4 rounded-xl border-2 border-[#6b7280] bg-white text-[#6b7280] font-medium hover:bg-[#6b7280] hover:text-white transition-all duration-300 text-center cursor-pointer select-none"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/category/${category.id}`); }}
                    >
                      View All {category.name}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="spacer"></div>

      {/* Featured Resources Section */}
      <section className="apple-section">
        <div className="max-w-6xl mx-auto px-4">
          <div className="apple-card p-10 text-center bg-gradient-to-br from-blue-50 to-purple-50">
            <h3 className="card-title mb-4">Ready to Start Your Journey?</h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Begin with our Getting Started guides and progressively build your skills. 
              Each guide is designed to provide practical, hands-on knowledge.
            </p>

            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-3xl font-bold text-[#6b7280] mb-2">
                  {guides.length}+
                </div>
                <div className="text-gray-600">Expert Guides</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-3xl font-bold text-[#6b7280] mb-2">
                  {guidesCategories.length}
                </div>
                <div className="text-gray-600">Categories</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-3xl font-bold text-[#6b7280] mb-2">
                  {guides.reduce((sum, guide) => sum + guide.duration, 0)}+
                </div>
                <div className="text-gray-600">Hours of Content</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Path Section */}
      <section className="apple-section bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="section-title text-center mb-12">Recommended Learning Path</h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-6 apple-card p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-xl font-bold text-lg flex-shrink-0">
                1
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Start with Fundamentals</h4>
                <p className="text-gray-600 text-sm">
                  Complete all Getting Started guides to build a strong foundation in penetration testing concepts and lab setup.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6 apple-card p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-xl font-bold text-lg flex-shrink-0">
                2
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Master Technical Skills</h4>
                <p className="text-gray-600 text-sm">
                  Progress to Technical Guides for in-depth tutorials on web security, network scanning, and OSINT techniques.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6 apple-card p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 text-red-600 rounded-xl font-bold text-lg flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Explore Advanced Topics</h4>
                <p className="text-gray-600 text-sm">
                  Challenge yourself with advanced exploitation techniques, red team operations, and complex attack scenarios.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6 apple-card p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 text-purple-600 rounded-xl font-bold text-lg flex-shrink-0">
                4
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Practice with Tools</h4>
                <p className="text-gray-600 text-sm">
                  Dive deep into specific tools with our dedicated tutorials. Master Burp Suite, Metasploit, and more.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="spacer"></div>
    </div>
  );
};

export default GuidesPage;
