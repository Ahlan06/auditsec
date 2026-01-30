import { Link } from 'react-router-dom';
import { Zap, Code, Search, Shield, Lock, Eye } from 'lucide-react';

const ToolsPage = () => {
  const tools = [
    {
      id: 1,
      name: "Advanced OSINT Suite",
      description: "Complete reconnaissance toolkit for ethical hackers",
      price: "$49.99",
      category: "OSINT",
      icon: <Search className="w-8 h-8" />
    },
    {
      id: 2,
      name: "Web Penetration Kit",
      description: "Professional web application security testing tools",
      price: "$79.99",
      category: "WebSec",
      icon: <Code className="w-8 h-8" />
    },
    {
      id: 3,
      name: "Network Scanner Pro",
      description: "Advanced network discovery and vulnerability assessment",
      price: "$59.99",
      category: "Network",
      icon: <Shield className="w-8 h-8" />
    },
    {
      id: 4,
      name: "Crypto Analysis Tools",
      description: "Cryptographic analysis and hash cracking utilities",
      price: "$89.99",
      category: "Crypto",
      icon: <Lock className="w-8 h-8" />
    }
  ];

  return (
    <div className="min-h-screen bg-black text-green-400 pt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Zap className="w-16 h-16 mx-auto mb-4 text-green-400" />
          <h1 className="text-5xl font-bold mb-4">Hacking Tools</h1>
          <p className="text-xl text-gray-400">
            Professional-grade tools for ethical hackers and security researchers
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
          {tools.map((tool) => (
            <div key={tool.id} className="border border-gray-700 rounded-lg p-6 hover:border-green-400 transition-colors">
              <div className="flex items-start space-x-4">
                <div className="text-green-400">
                  {tool.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-green-400 mb-2">{tool.name}</h3>
                  <p className="text-gray-400 mb-4">{tool.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm bg-green-400/10 text-green-400 px-3 py-1 rounded">
                      {tool.category}
                    </span>
                    <span className="text-2xl font-bold text-green-400">{tool.price}</span>
                  </div>
                  <button className="w-full mt-4 bg-green-400 text-black py-2 px-4 rounded font-bold hover:bg-green-300 transition-colors">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Terminal Demo */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-gray-900 rounded-lg p-6 font-mono">
            <div className="flex items-center mb-4">
              <Eye className="w-5 h-5 mr-2 text-green-400" />
              <span className="text-green-400">root@auditsec:~# ./osint_suite --demo</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="text-green-300">[+] Loading OSINT modules...</div>
              <div className="text-gray-400">    ├── Domain enumeration: READY</div>
              <div className="text-gray-400">    ├── Social media scraper: READY</div>
              <div className="text-gray-400">    ├── Email harvester: READY</div>
              <div className="text-gray-400">    └── Metadata analyzer: READY</div>
              <div className="text-green-300">[+] All tools loaded successfully!</div>
              <div>root@auditsec:~# echo "Ready for ethical reconnaissance" 🕵️</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolsPage;