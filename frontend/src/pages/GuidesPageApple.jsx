import { Shield, BookOpen, Video, FileText, Lightbulb, ArrowRight, Download, Clock, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const GuidesPageApple = () => {
  const categories = [
    {
      icon: Shield,
      title: "Getting Started",
      description: "Introduction to cybersecurity and pentesting basics",
      guides: [
        { name: "What is Penetration Testing?", duration: "5 min", difficulty: "Beginner" },
        { name: "Setting Up Your Security Lab", duration: "15 min", difficulty: "Beginner" },
        { name: "Essential Tools Overview", duration: "10 min", difficulty: "Beginner" },
      ],
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: BookOpen,
      title: "Technical Guides",
      description: "In-depth tutorials and methodologies",
      guides: [
        { name: "Web Application Security Testing", duration: "30 min", difficulty: "Intermediate" },
        { name: "Network Scanning Techniques", duration: "25 min", difficulty: "Intermediate" },
        { name: "OSINT Investigation Methods", duration: "20 min", difficulty: "Advanced" },
      ],
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: Video,
      title: "Video Tutorials",
      description: "Step-by-step video demonstrations",
      guides: [
        { name: "Live Web Pentest Demo", duration: "45 min", difficulty: "All Levels" },
        { name: "Using Burp Suite Effectively", duration: "35 min", difficulty: "Intermediate" },
        { name: "Reconnaissance Best Practices", duration: "20 min", difficulty: "Beginner" },
      ],
      color: "from-orange-500 to-red-600"
    },
    {
      icon: FileText,
      title: "Cheat Sheets",
      description: "Quick reference guides and commands",
      guides: [
        { name: "Linux Commands Cheat Sheet", duration: "Quick Ref", difficulty: "All Levels" },
        { name: "SQL Injection Payloads", duration: "Quick Ref", difficulty: "Intermediate" },
        { name: "Nmap Scanning Options", duration: "Quick Ref", difficulty: "All Levels" },
      ],
      color: "from-green-500 to-teal-600"
    },
  ];

  const featuredGuides = [
    {
      title: "Complete Web Pentesting Course",
      description: "Master web application security from basics to advanced exploitation techniques",
      duration: "8 hours",
      modules: 12,
      difficulty: "All Levels",
      badge: "Most Popular"
    },
    {
      title: "OSINT Masterclass",
      description: "Learn professional open-source intelligence gathering and analysis",
      duration: "6 hours",
      modules: 10,
      difficulty: "Intermediate",
      badge: "New"
    },
    {
      title: "Network Security Fundamentals",
      description: "Understand network protocols, scanning, and vulnerability assessment",
      duration: "5 hours",
      modules: 8,
      difficulty: "Beginner",
      badge: "Editor's Choice"
    },
  ];

  const resources = [
    {
      icon: Download,
      title: "Free Resources",
      description: "Downloadable tools, templates, and scripts",
      count: "25+ items"
    },
    {
      icon: Lightbulb,
      title: "Best Practices",
      description: "Industry standards and ethical guidelines",
      count: "15+ articles"
    },
    {
      icon: Clock,
      title: "Quick Tips",
      description: "Short tips and tricks for daily security work",
      count: "50+ tips"
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-20 transition-colors duration-300">
      {/* Hero Section */}
      <section className="apple-section pb-0">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 mb-6 fade-in">
            <BookOpen className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Knowledge Base</span>
          </div>
          
          <h1 className="hero-title mb-6 fade-in">
            Security Guides
          </h1>
          <p className="hero-subtitle mb-8 fade-in-up max-w-3xl mx-auto" style={{animationDelay: '0.1s'}}>
            Comprehensive guides, tutorials, and resources to enhance your cybersecurity skills
          </p>
        </div>
      </section>

      {/* Featured Guides */}
      <section className="apple-section pt-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="section-title mb-12 text-center">Featured Courses</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {featuredGuides.map((guide, index) => (
              <div
                key={index}
                className="product-card p-8 fade-in-up"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                {guide.badge && (
                  <div className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
                    {guide.badge}
                  </div>
                )}
                
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
                  {guide.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                  {guide.description}
                </p>

                <div className="flex items-center gap-4 mb-6 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    <span>{guide.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen size={16} />
                    <span>{guide.modules} modules</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                    {guide.difficulty}
                  </span>
                  <button className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm flex items-center gap-1 transition-colors">
                    Explore <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="apple-section bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="section-title mb-4 text-center">Browse by Category</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            Choose from our organized collection of guides tailored to your learning needs
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <div
                  key={index}
                  className="apple-card p-8 fade-in-up hover:shadow-2xl"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${category.color} rounded-2xl mb-4`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
                    {category.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                    {category.description}
                  </p>

                  <div className="space-y-3">
                    {category.guides.map((guide, gIndex) => (
                      <div
                        key={gIndex}
                        className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                      >
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                            {guide.name}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {guide.duration}
                            </span>
                            <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                              {guide.difficulty}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      </div>
                    ))}
                  </div>

                  <button className="w-full mt-6 apple-button-secondary text-sm py-2">
                    View All {category.title}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Additional Resources */}
      <section className="apple-section">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="section-title mb-12 text-center">Additional Resources</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {resources.map((resource, index) => {
              const Icon = resource.icon;
              return (
                <div
                  key={index}
                  className="product-card p-8 text-center fade-in-up"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl mb-4">
                    <Icon className="w-8 h-8 text-gray-700 dark:text-gray-300" />
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
                    {resource.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                    {resource.description}
                  </p>
                  <span className="text-xs font-medium text-blue-500 dark:text-blue-400">
                    {resource.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="apple-section bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="apple-card p-12">
            <Star className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Ready to Level Up Your Skills?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Access our premium guides and courses to accelerate your cybersecurity journey
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/services" className="apple-button">
                Explore Services
              </Link>
              <Link to="/contact" className="apple-button-secondary">
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GuidesPageApple;
