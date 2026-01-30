// Mock products data for testing without MongoDB
// Uses MongoDB ObjectId-style IDs for compatibility

const mockProducts = [
  {
    _id: '674d1a2e3f8b4c0012345671',
    name: 'OSINT Toolkit Pro',
    description: 'Professional OSINT investigation suite with automated data collection',
    longDescription: 'Complete OSINT framework for comprehensive digital investigations. Includes social media analysis, domain research, email verification, and threat intelligence gathering. Perfect for security professionals conducting authorized open-source intelligence operations.',
    price: 29.99,
    category: 'osint',
    type: 'toolkit',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80',
    tags: ['osint', 'investigation', 'intelligence', 'automation'],
    featured: true,
    rating: 4.8,
    downloads: 1204,
    fileSize: '85 MB',
    lastUpdated: '2025-11-10',
    compatibility: ['Windows', 'Linux', 'macOS'],
    requirements: ['Python 3.8+', '4GB RAM', '200MB Storage'],
    features: [
      'Social media reconnaissance',
      'Email and phone lookup',
      'Domain and IP intelligence',
      'Data breach search',
      'Report generation',
      'Automated workflow'
    ]
  },
  {
    _id: '674d1a2e3f8b4c0012345672',
    name: 'Web Pentest Kit',
    description: 'Complete web application security testing toolkit',
    longDescription: 'Comprehensive web pentest framework with vulnerability scanners, custom payloads, and exploitation tools. Includes SQLi, XSS, CSRF, and authentication bypass modules.',
    price: 49.99,
    category: 'pentest',
    type: 'toolkit',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80',
    tags: ['pentest', 'web', 'vulnerability', 'exploitation'],
    featured: true,
    rating: 4.9,
    downloads: 2103,
    fileSize: '120 MB',
    lastUpdated: '2025-11-08',
    compatibility: ['Kali Linux', 'Parrot OS', 'Windows WSL'],
    requirements: ['Python 3.9+', 'Burp Suite', '8GB RAM'],
    features: [
      'Automated vulnerability scanning',
      'Custom payload generation',
      'SQLi exploitation tools',
      'XSS detector and exploiter',
      'Authentication testing',
      'API security testing'
    ]
  },
  {
    _id: '674d1a2e3f8b4c0012345673',
    name: 'Cybersecurity Essentials Guide',
    description: 'Complete guide to modern cybersecurity principles and practices',
    longDescription: 'Professional PDF guide covering all aspects of cybersecurity from basics to advanced topics. Perfect for beginners and experienced professionals looking to refresh their knowledge.',
    price: 19.99,
    category: 'guides',
    type: 'pdf',
    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80',
    tags: ['guide', 'pdf', 'learning', 'fundamentals'],
    featured: false,
    rating: 4.7,
    downloads: 3421,
    fileSize: '25 MB',
    lastUpdated: '2025-11-05',
    compatibility: ['PDF Reader Required'],
    requirements: ['PDF Reader'],
    features: [
      '300+ pages of content',
      'Real-world examples',
      'Best practices',
      'Security frameworks',
      'Compliance standards',
      'Regular updates'
    ]
  },
  {
    _id: '674d1a2e3f8b4c0012345674',
    name: 'Network Scanner Pro',
    description: 'Advanced network reconnaissance and mapping tool',
    longDescription: 'Professional network scanning toolkit with port discovery, service detection, and vulnerability assessment capabilities. Optimized for large-scale network assessments.',
    price: 34.99,
    category: 'pentest',
    type: 'tool',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
    tags: ['network', 'scanning', 'reconnaissance', 'mapping'],
    featured: true,
    rating: 4.6,
    downloads: 1567,
    fileSize: '45 MB',
    lastUpdated: '2025-11-12',
    compatibility: ['Linux', 'Windows', 'macOS'],
    requirements: ['Nmap', 'Python 3.8+', '2GB RAM'],
    features: [
      'Fast port scanning',
      'Service fingerprinting',
      'OS detection',
      'Network topology mapping',
      'Vulnerability detection',
      'Custom scan profiles'
    ]
  },
  {
    _id: '674d1a2e3f8b4c0012345675',
    name: 'Ethical Hacking Course',
    description: 'Complete video training course for aspiring ethical hackers',
    longDescription: 'Comprehensive 40+ hour video course covering all aspects of ethical hacking from basics to advanced penetration testing techniques. Includes hands-on labs and real-world scenarios.',
    price: 99.99,
    category: 'videos',
    type: 'course',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
    tags: ['training', 'video', 'course', 'certification'],
    featured: false,
    rating: 4.9,
    downloads: 856,
    fileSize: '12 GB',
    lastUpdated: '2025-10-28',
    compatibility: ['Video Player Required'],
    requirements: ['8GB Storage', 'HD Video Player'],
    features: [
      '40+ hours of content',
      'Hands-on labs',
      'Real-world scenarios',
      'Certification prep',
      'Lifetime access',
      'Community support'
    ]
  },
  {
    _id: '674d1a2e3f8b4c0012345676',
    name: 'Premium Wordlists Collection',
    description: 'Massive collection of wordlists for password cracking and fuzzing',
    longDescription: 'Professional-grade wordlist collection containing millions of passwords, usernames, subdomains, and directories for security testing and penetration testing.',
    price: 14.99,
    category: 'tools',
    type: 'pack',
    image: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&q=80',
    tags: ['wordlist', 'passwords', 'fuzzing', 'bruteforce'],
    featured: false,
    rating: 4.5,
    downloads: 2891,
    fileSize: '3.5 GB',
    lastUpdated: '2025-11-01',
    compatibility: ['Any Platform'],
    requirements: ['4GB Storage'],
    features: [
      '50+ million passwords',
      'Common usernames',
      'Subdomain wordlists',
      'Directory bruteforce lists',
      'API fuzzing payloads',
      'Regular updates'
    ]
  },
  {
    _id: '674d1a2e3f8b4c0012345677',
    name: 'Bug Bounty Methodology',
    description: 'Step-by-step bug bounty hunting methodology guide',
    longDescription: 'Professional bug bounty hunting guide with proven methodologies, checklists, and templates. Learn how to find critical vulnerabilities and maximize your earnings.',
    price: 24.99,
    category: 'guides',
    type: 'pdf',
    image: 'https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?w=800&q=80',
    tags: ['bug-bounty', 'methodology', 'guide', 'hunting'],
    featured: true,
    rating: 4.8,
    downloads: 1324,
    fileSize: '18 MB',
    lastUpdated: '2025-11-07',
    compatibility: ['PDF Reader Required'],
    requirements: ['PDF Reader'],
    features: [
      'Complete methodology',
      'Vulnerability checklists',
      'Report templates',
      'Platform strategies',
      'Automation scripts',
      'Interview tips'
    ]
  },
  {
    _id: '674d1a2e3f8b4c0012345678',
    name: 'Mobile App Security Kit',
    description: 'Tools for Android and iOS security testing',
    longDescription: 'Complete mobile application security testing toolkit with static and dynamic analysis tools, reverse engineering utilities, and vulnerability scanners for both Android and iOS.',
    price: 44.99,
    category: 'pentest',
    type: 'toolkit',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80',
    tags: ['mobile', 'android', 'ios', 'appsec'],
    featured: false,
    rating: 4.7,
    downloads: 734,
    fileSize: '95 MB',
    lastUpdated: '2025-11-09',
    compatibility: ['Windows', 'Linux', 'macOS'],
    requirements: ['Java 11+', 'Android SDK', '4GB RAM'],
    features: [
      'APK/IPA analysis',
      'SSL pinning bypass',
      'Root detection bypass',
      'Code decompilation',
      'Traffic interception',
      'Automated testing'
    ]
  },
  {
    _id: '674d1a2e3f8b4c0012345679',
    name: 'API Security Testing Guide',
    description: 'Complete guide to REST and GraphQL API security testing',
    longDescription: 'Comprehensive guide covering all aspects of API security testing including authentication, authorization, injection attacks, and rate limiting bypass techniques.',
    price: 29.99,
    category: 'guides',
    type: 'pdf',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
    tags: ['api', 'rest', 'graphql', 'security'],
    featured: false,
    rating: 4.6,
    downloads: 1092,
    fileSize: '22 MB',
    lastUpdated: '2025-10-30',
    compatibility: ['PDF Reader Required'],
    requirements: ['PDF Reader'],
    features: [
      'REST API testing',
      'GraphQL vulnerabilities',
      'Authentication bypass',
      'Authorization flaws',
      'Injection techniques',
      'Automation scripts'
    ]
  },
  {
    _id: '674d1a2e3f8b4c001234567a',
    name: 'WiFi Pentest Pack',
    description: 'Wireless network security testing toolkit',
    longDescription: 'Professional wireless security toolkit with WPA/WPA2 cracking tools, evil twin attack utilities, and wireless traffic analysis capabilities.',
    price: 39.99,
    category: 'pentest',
    type: 'toolkit',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80',
    tags: ['wifi', 'wireless', 'wpa', 'cracking'],
    featured: false,
    rating: 4.5,
    downloads: 1456,
    fileSize: '68 MB',
    lastUpdated: '2025-11-06',
    compatibility: ['Kali Linux', 'Parrot OS'],
    requirements: ['Compatible WiFi adapter', '4GB RAM'],
    features: [
      'WPA/WPA2 cracking',
      'Evil twin attacks',
      'Deauth attacks',
      'Packet capture',
      'Handshake analysis',
      'Custom wordlists'
    ]
  },
  {
    _id: '674d1a2e3f8b4c001234567b',
    name: 'Social Engineering Toolkit',
    description: 'Advanced social engineering testing framework',
    longDescription: 'Professional social engineering toolkit for authorized security assessments. Includes phishing templates, awareness training materials, and reporting tools.',
    price: 34.99,
    category: 'pentest',
    type: 'toolkit',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80',
    tags: ['social-engineering', 'phishing', 'awareness'],
    featured: true,
    rating: 4.7,
    downloads: 983,
    fileSize: '52 MB',
    lastUpdated: '2025-11-11',
    compatibility: ['Windows', 'Linux', 'macOS'],
    requirements: ['Python 3.8+', 'Email account'],
    features: [
      'Phishing templates',
      'SMS phishing',
      'Vishing scripts',
      'Pretexting guides',
      'Awareness training',
      'Campaign tracking'
    ]
  },
  {
    _id: '674d1a2e3f8b4c001234567c',
    name: 'Docker Security Masterclass',
    description: 'Complete video course on container security',
    longDescription: 'Comprehensive video training on Docker and Kubernetes security. Learn container hardening, vulnerability scanning, runtime protection, and security best practices.',
    price: 79.99,
    category: 'videos',
    type: 'course',
    image: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800&q=80',
    tags: ['docker', 'kubernetes', 'containers', 'devsecops'],
    featured: false,
    rating: 4.8,
    downloads: 567,
    fileSize: '8.5 GB',
    lastUpdated: '2025-10-25',
    compatibility: ['Video Player Required'],
    requirements: ['6GB Storage', 'HD Video Player'],
    features: [
      '30+ hours content',
      'Container hardening',
      'Image scanning',
      'Runtime protection',
      'Kubernetes security',
      'CI/CD integration'
    ]
  }
];

// Helper functions
function getMockProducts(filters = {}) {
  // Add 'id' field for frontend compatibility (same as _id)
  let filtered = mockProducts.map(p => ({ ...p, id: p._id }));

  // Filter by category
  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter(p => p.category === filters.category);
  }

  // Filter by type
  if (filters.type) {
    filtered = filtered.filter(p => p.type === filters.type);
  }

  // Filter by featured
  if (filters.featured !== undefined) {
    filtered = filtered.filter(p => p.featured === filters.featured);
  }

  // Search in name, description, tags
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower) ||
      p.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }

  // Sort
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        filtered.sort((a, b) => b.downloads - a.downloads);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
        break;
      default:
        break;
    }
  }

  // Pagination
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 12;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  const paginated = filtered.slice(startIndex, endIndex);

  return {
    products: paginated,
    total: filtered.length,
    page,
    pages: Math.ceil(filtered.length / limit)
  };
}

function getMockProductById(id) {
  const product = mockProducts.find(p => p._id === id);
  if (product) {
    return { ...product, id: product._id };
  }
  return null;
}

export {
  mockProducts,
  getMockProducts,
  getMockProductById
};
