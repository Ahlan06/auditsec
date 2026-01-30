import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const DownloadPage = () => {
  const { token } = useParams();
  const [downloadStatus, setDownloadStatus] = useState('loading');
  const [downloadData, setDownloadData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDownload = async () => {
      try {
        // In a real app, this would call the backend API
        setTimeout(() => {
          if (token === 'valid-token') {
            setDownloadData({
              productName: 'AuditSec Recon Pack',
              downloadUrl: 'https://example.com/download/file.zip',
              expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
            });
            setDownloadStatus('ready');
          } else {
            setError('Invalid or expired download link');
            setDownloadStatus('error');
          }
        }, 1000);
      } catch (err) {
        setError('Failed to fetch download information');
        setDownloadStatus('error');
      }
    };

    if (token) {
      fetchDownload();
    } else {
      setError('No download token provided');
      setDownloadStatus('error');
    }
  }, [token]);

  const handleDownload = () => {
    if (downloadData?.downloadUrl) {
      window.open(downloadData.downloadUrl, '_blank');
      setDownloadStatus('downloaded');
    }
  };

  if (downloadStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="cyber-spinner w-12 h-12 mx-auto mb-4"></div>
          <p className="text-cyber-green font-mono">Verifying download link...</p>
        </div>
      </div>
    );
  }

  if (downloadStatus === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <AlertTriangle className="w-24 h-24 text-cyber-red mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-cyber-red font-cyber mb-4">
            Download Error
          </h1>
          <p className="text-gray-400 font-mono mb-8">
            {error}
          </p>
          <Link to="/products" className="cyber-btn">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          {downloadStatus === 'downloaded' ? (
            <CheckCircle className="w-24 h-24 text-cyber-green mx-auto mb-6" />
          ) : (
            <Download className="w-24 h-24 text-cyber-blue mx-auto mb-6" />
          )}
          
          <h1 className="text-4xl font-bold text-cyber-green font-cyber mb-4">
            {downloadStatus === 'downloaded' ? 'Download Complete!' : 'Download Ready'}
          </h1>
          
          <p className="text-gray-400 font-mono text-lg">
            {downloadStatus === 'downloaded' 
              ? 'Your file has been downloaded successfully.'
              : 'Your secure download link is ready to use.'
            }
          </p>
        </div>

        <div className="cyber-card p-8 mb-8">
          <h2 className="text-2xl font-bold text-cyber-green font-mono mb-6">
            Product Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-cyber-blue font-mono font-bold mb-2">Product Name</h3>
              <p className="text-gray-300 font-mono">{downloadData?.productName}</p>
            </div>
            <div>
              <h3 className="text-cyber-blue font-mono font-bold mb-2">Download Token</h3>
              <p className="text-gray-300 font-mono break-all">{token}</p>
            </div>
          </div>

          <div className="border-t border-cyber-border pt-6">
            <div className="flex items-center space-x-2 mb-4">
              <Clock className="w-5 h-5 text-cyber-accent" />
              <span className="text-cyber-accent font-mono font-bold">
                Link Expires: {downloadData?.expiresAt?.toLocaleString()}
              </span>
            </div>
            
            {downloadStatus === 'ready' && (
              <button
                onClick={handleDownload}
                className="w-full bg-cyber-green text-black hover:bg-cyber-blue hover:text-white transition-all duration-300 px-6 py-4 font-mono font-bold uppercase tracking-wider text-center rounded shadow-glow-green hover:shadow-glow-blue mb-4"
              >
                <Download className="w-6 h-6 inline mr-2" />
                Download {downloadData?.productName}
              </button>
            )}
            
            {downloadStatus === 'downloaded' && (
              <div className="text-center py-4">
                <p className="text-cyber-green font-mono mb-4">
                  ✅ Download completed successfully!
                </p>
                <p className="text-gray-400 font-mono text-sm">
                  This download link has been used and is no longer valid.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="cyber-card p-6 border-cyber-accent">
            <h3 className="text-cyber-accent font-mono font-bold mb-4">
              ⚠️ Security Guidelines
            </h3>
            <ul className="text-gray-400 font-mono text-sm space-y-2">
              <li>• Use only for authorized security testing</li>
              <li>• Ensure proper permissions before scanning</li>
              <li>• Follow all applicable laws and regulations</li>
              <li>• Keep tools updated for security</li>
            </ul>
          </div>

          <div className="cyber-card p-6">
            <h3 className="text-cyber-blue font-mono font-bold mb-4">
              📚 Getting Started
            </h3>
            <ul className="text-gray-400 font-mono text-sm space-y-2">
              <li>• Extract files to secure location</li>
              <li>• Read included documentation</li>
              <li>• Verify file integrity (checksums)</li>
              <li>• Follow setup instructions</li>
            </ul>
          </div>
        </div>

        <div className="text-center">
          <Link
            to="/products"
            className="cyber-btn px-8 py-3 text-lg"
          >
            Browse More Tools
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DownloadPage;