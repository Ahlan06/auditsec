import { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Shield, Zap, Download, Star, ArrowRight } from 'lucide-react';
import useAppStore from '../store/appStore';

const HomePage = () => {
  const [currentLine, setCurrentLine] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const terminalRef = useRef(null);
  
  const { featuredProducts, setFeaturedProducts } = useAppStore();

  const terminalLines = useMemo(() => [
    'root@zeroday:~# whoami',
    'ethical_hacker',
    'root@zeroday:~# ls -la /shop/products',
    'drwxr-xr-x  5 root root 4096 Nov 10 2025 osint_tools/',
    'drwxr-xr-x  3 root root 4096 Nov 10 2025 pentest_kits/',
    'drwxr-xr-x  4 root root 4096 Nov 10 2025 security_guides/',
    'drwxr-xr-x  2 root root 4096 Nov 10 2025 video_training/',
    'root@zeroday:~# cat welcome.txt',
    '==================================',
    'Welcome to ZeroDay Shop',
    'Premium Digital Tools for Ethical Hackers',
    '==================================',
    'root@zeroday:~# ./start_shopping.sh',
    'Initializing secure connection...',
    'Connection established ✓',
    'Loading product catalog...',
    'Ready to hack (ethically)! 🔐',
    'root@zeroday:~# _'
  ], []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (currentLine < terminalLines.length - 1) {
        const line = terminalLines[currentLine];
        if (displayText.length < line.length) {
          setDisplayText(line.substring(0, displayText.length + 1));
        } else {
          setCurrentLine(currentLine + 1);
          setDisplayText('');
        }
      }
    }, 100);

    return () => clearInterval(timer);
  }, [currentLine, displayText, terminalLines]);

  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setShowCursor(!showCursor);
    }, 500);

    return () => clearInterval(cursorTimer);
  }, [showCursor]);

  // Mock featured products (in real app, fetch from API)
  useEffect(() => {
    const mockProducts = [
      {
        id: 1,
        name: 'ZeroDay Recon Pack',
        description: 'Advanced reconnaissance toolkit for ethical hackers',
        price: 29.99,
        category: 'pentest',
        image: '/images/recon-pack.jpg',
        rating: 4.8,
        downloads: 1204
      },
      {
        id: 2,
        name: 'SINWAR OSINT Suite',
        description: 'Complete OSINT investigation framework',
        price: 49.99,
        category: 'osint',
        image: '/images/osint-suite.jpg',
        rating: 4.9,
        downloads: 856
      },
      {
        id: 3,
        name: 'Web Pentest Toolkit',
        description: 'Comprehensive web application testing tools',
        price: 39.99,
        category: 'pentest',
        image: '/images/web-toolkit.jpg',
        rating: 4.7,
        downloads: 2103
      }
    ];
    setFeaturedProducts(mockProducts);
  }, [setFeaturedProducts]);

  const features = [
    {
      icon: Shield,
      title: 'Ethical & Legal',
      description: 'All tools are designed for authorized security testing only'
    },
    {
      icon: Zap,
      title: 'Instant Download',
      description: 'Get your tools immediately after purchase via secure links'
    },
    {
      icon: Terminal,
      title: 'Professional Grade',
      description: 'Enterprise-quality tools used by security professionals'
    },
    {
      icon: Download,
      title: 'Always Updated',
      description: 'Regular updates to stay ahead of latest vulnerabilities'
    }
  ];

  const stats = [
    { label: 'Happy Hackers', value: '10,000+' },
    { label: 'Digital Products', value: '200+' },
    { label: 'Security Tests', value: '1M+' },
    { label: 'Vulnerabilities Found', value: '50,000+' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Terminal */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl lg:text-6xl font-bold mb-6">
                <span className="text-cyber-green neon-text font-cyber" data-text="ZeroDay">
                  ZeroDay
                </span>
                <br />
                <span className="text-white">Shop</span>
              </h1>
              
              <p className="text-xl text-gray-300 mb-8 font-mono">
                Premium digital tools for{' '}
                <span className="text-cyber-green animate-pulse">ethical hackers</span>,{' '}
                <span className="text-cyber-blue">pentesters</span>, and{' '}
                <span className="text-cyber-accent">security researchers</span>.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  to="/products"
                  className="cyber-btn flex items-center justify-center px-8 py-3 text-lg"
                >
                  Browse Arsenal
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                
                <Link
                  to="/products?featured=true"
                  className="border-2 border-cyber-blue text-cyber-blue hover:bg-cyber-blue hover:text-black px-8 py-3 font-mono uppercase tracking-wider transition-all duration-300 text-center"
                >
                  Featured Tools
                </Link>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-400 font-mono">
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-cyber-green" />
                  Legally compliant
                </div>
                <div className="flex items-center">
                  <Zap className="w-4 h-4 mr-2 text-cyber-blue" />
                  Instant delivery
                </div>
              </div>
            </motion.div>

            {/* Right Terminal */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-cyber-dark border-2 border-cyber-green rounded-lg p-6 shadow-cyber"
            >
              <div className="flex items-center mb-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-cyber-red rounded-full"></div>
                  <div className="w-3 h-3 bg-cyber-accent rounded-full"></div>
                  <div className="w-3 h-3 bg-cyber-green rounded-full"></div>
                </div>
                <span className="ml-4 text-gray-400 text-sm font-mono">
                  terminal - zeroday@shop
                </span>
              </div>
              
              <div ref={terminalRef} className="font-mono text-sm space-y-1 h-64 overflow-hidden">
                {terminalLines.slice(0, currentLine).map((line, index) => (
                  <div key={index} className="text-cyber-green">
                    {line}
                  </div>
                ))}
                {currentLine < terminalLines.length && (
                  <div className="text-cyber-green">
                    {displayText}
                    {showCursor && <span className="animate-pulse">|</span>}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-cyber-gray/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl lg:text-4xl font-bold text-cyber-green font-mono mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400 font-mono text-sm">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-cyber-green font-cyber mb-4">
              Why Choose ZeroDay Shop?
            </h2>
            <p className="text-gray-400 font-mono max-w-2xl mx-auto">
              Professional-grade security tools designed by experts, for experts.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="cyber-card p-6 text-center"
              >
                <feature.icon className="w-12 h-12 text-cyber-green mx-auto mb-4" />
                <h3 className="text-lg font-bold text-cyber-green font-mono mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm font-mono">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-cyber-gray/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-cyber-green font-cyber mb-4">
              Featured Arsenal
            </h2>
            <p className="text-gray-400 font-mono">
              Our most popular tools for ethical hacking professionals
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="cyber-card p-6"
              >
                <div className="aspect-video bg-cyber-dark rounded mb-4 flex items-center justify-center">
                  <Terminal className="w-12 h-12 text-cyber-green/50" />
                </div>
                
                <h3 className="text-lg font-bold text-cyber-green font-mono mb-2">
                  {product.name}
                </h3>
                
                <p className="text-gray-400 text-sm font-mono mb-4">
                  {product.description}
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-cyber-blue font-mono">
                    €{product.price}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-cyber-accent fill-current" />
                    <span className="text-cyber-accent font-mono text-sm">
                      {product.rating}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500 font-mono mb-4">
                  <span>{product.downloads} downloads</span>
                  <span className="capitalize">{product.category}</span>
                </div>
                
                <Link
                  to={`/product/${product.id}`}
                  className="cyber-btn w-full text-center"
                >
                  View Details
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/products"
              className="cyber-btn px-8 py-3 text-lg"
            >
              View All Products
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-cyber-green font-cyber mb-4">
              Ready to Level Up Your Security Skills?
            </h2>
            <p className="text-gray-400 font-mono mb-8 text-lg">
              Join thousands of ethical hackers who trust ZeroDay Shop for their security toolkit.
            </p>
            <Link
              to="/products"
              className="cyber-btn px-8 py-4 text-lg inline-flex items-center"
            >
              Start Your Journey
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;