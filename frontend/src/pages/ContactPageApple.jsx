import { Mail, MessageCircle, Send, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';
import TerminalMac from '../components/TerminalMac';

const ContactPage = () => {
  const formRef = useRef();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const emailJsConfig = {
    serviceId: (import.meta.env.VITE_EMAILJS_SERVICE_ID || '').trim(),
    templateId: (import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '').trim(),
    publicKey: (import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '').trim(),
  };

  const missingEmailJsVars = [
    !emailJsConfig.serviceId ? 'VITE_EMAILJS_SERVICE_ID' : null,
    !emailJsConfig.templateId ? 'VITE_EMAILJS_TEMPLATE_ID' : null,
    !emailJsConfig.publicKey ? 'VITE_EMAILJS_PUBLIC_KEY' : null,
  ].filter(Boolean);

  const handleTelegramClick = () => {
    window.open('https://t.me/Ahlan06', '_blank');
  };

  const handleEmailClick = () => {
    window.location.href = 'mailto:ahlan.mira@icloud.com';
  };

  // Validation functions
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        return '';
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!validateEmail(value)) return 'Please enter a valid email';
        return '';
      case 'subject':
        if (!value.trim()) return 'Subject is required';
        if (value.trim().length < 3) return 'Subject must be at least 3 characters';
        return '';
      case 'message':
        if (!value.trim()) return 'Message is required';
        if (value.trim().length < 10) return 'Message must be at least 10 characters';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validate on change if field has been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({ name: true, email: true, subject: true, message: true });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // EmailJS configuration (Vite env vars). See EMAILJS_CONFIG_GUIDE.md.
      if (missingEmailJsVars.length > 0) {
        console.error('⚠️ EmailJS non configuré. Variables manquantes:', missingEmailJsVars);
        setSubmitStatus({
          type: 'config',
          message: `EmailJS non configuré. Ajoute: ${missingEmailJsVars.join(', ')}`,
        });
        setTimeout(() => setSubmitStatus(null), 7000);
        return;
      }

      console.log('📧 Envoi de l\'email en cours avec EmailJS...');
      
      // Utiliser send() au lieu de sendForm() pour plus de contrôle
      await emailjs.send(
        emailJsConfig.serviceId,
        emailJsConfig.templateId,
        {
          from_name: formData.name,
          from_email: formData.email,
          to_name: 'AuditSec',
          subject: formData.subject,
          message: formData.message,
          reply_to: formData.email
        },
        emailJsConfig.publicKey
      );
      
      console.log('✅ Email envoyé avec succès !');
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTouched({});
      setErrors({});
      
      // Hide success message after 5 seconds
      setTimeout(() => setSubmitStatus(null), 5000);
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
      console.error('Détails:', {
        message: error.message,
        text: error.text,
        status: error.status
      });

      const rawText = `${error?.text || ''}`;
      const rawMessage = `${error?.message || ''}`;
      const combined = `${rawText} ${rawMessage}`.toLowerCase();

      let userMessage = error?.text || error?.message || "Erreur lors de l'envoi.";
      if (combined.includes('invalid grant')) {
        userMessage =
          'Gmail (EmailJS) non connecté ou autorisation expirée. ' +
          'Dans EmailJS → Email Services → Gmail → Reconnect / Re-authorize, puis réessaie.';
      }

      setSubmitStatus({
        type: 'error',
        message: userMessage,
      });
      setTimeout(() => setSubmitStatus(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFieldValid = (name) => {
    return touched[name] && !errors[name] && formData[name];
  };

  const isFieldInvalid = (name) => {
    return touched[name] && errors[name];
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Success/Error Banner */}
      {submitStatus && (
        <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-lg transition-all duration-500 max-w-md ${
          submitStatus === 'success' 
            ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700' 
            : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700'
        }`}
        style={{
          animation: 'slideDown 0.5s ease-out'
        }}>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              {submitStatus === 'success' ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-green-800 dark:text-green-200 font-medium">Message envoyé avec succès !</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <div className="flex-1">
                    <span className="text-red-800 dark:text-red-200 font-medium block">Échec de l'envoi</span>
                    <span className="text-red-600 dark:text-red-300 text-xs block mt-1">
                      {typeof submitStatus === 'object'
                        ? submitStatus.message
                        : 'Vérifiez la console (F12) ou contactez directement via Telegram/Email'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="apple-section pb-0">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="hero-title mb-6 fade-in">
            Get in Touch
          </h1>
          <p className="hero-subtitle mb-0 fade-in-up" style={{animationDelay: '0.1s'}}>
            Have a question or need support? We're here to help
          </p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="apple-section pt-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="apple-card p-10 fade-in-up">
            <h2 className="card-title mb-8 text-center">Send us a message</h2>
            
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div className="fade-in-up" style={{animationDelay: '0.1s'}}>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 outline-none ${
                      isFieldInvalid('name')
                        ? 'border-red-300 focus:border-red-500'
                        : isFieldValid('name')
                        ? 'border-green-300 focus:border-green-500'
                        : 'border-gray-200 focus:border-blue-500'
                    }`}
                    placeholder="John Doe"
                  />
                  {isFieldValid('name') && (
                    <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                  )}
                  {isFieldInvalid('name') && (
                    <AlertCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
                  )}
                </div>
                {errors.name && touched.name && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="fade-in-up" style={{animationDelay: '0.2s'}}>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 outline-none ${
                      isFieldInvalid('email')
                        ? 'border-red-300 focus:border-red-500'
                        : isFieldValid('email')
                        ? 'border-green-300 focus:border-green-500'
                        : 'border-gray-200 focus:border-blue-500'
                    }`}
                    placeholder="john@example.com"
                  />
                  {isFieldValid('email') && (
                    <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                  )}
                  {isFieldInvalid('email') && (
                    <AlertCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
                  )}
                </div>
                {errors.email && touched.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Subject Field */}
              <div className="fade-in-up" style={{animationDelay: '0.3s'}}>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 outline-none ${
                      isFieldInvalid('subject')
                        ? 'border-red-300 focus:border-red-500'
                        : isFieldValid('subject')
                        ? 'border-green-300 focus:border-green-500'
                        : 'border-gray-200 focus:border-blue-500'
                    }`}
                    placeholder="How can we help?"
                  />
                  {isFieldValid('subject') && (
                    <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                  )}
                  {isFieldInvalid('subject') && (
                    <AlertCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
                  )}
                </div>
                {errors.subject && touched.subject && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.subject}
                  </p>
                )}
              </div>

              {/* Message Field */}
              <div className="fade-in-up" style={{animationDelay: '0.4s'}}>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <div className="relative">
                  <textarea
                    id="message"
                    name="message"
                    rows="6"
                    value={formData.message}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 outline-none resize-none ${
                      isFieldInvalid('message')
                        ? 'border-red-300 focus:border-red-500'
                        : isFieldValid('message')
                        ? 'border-green-300 focus:border-green-500'
                        : 'border-gray-200 focus:border-blue-500'
                    }`}
                    placeholder="Tell us more about your inquiry..."
                  />
                  {isFieldValid('message') && (
                    <CheckCircle className="absolute right-4 top-4 w-5 h-5 text-green-500" />
                  )}
                  {isFieldInvalid('message') && (
                    <AlertCircle className="absolute right-4 top-4 w-5 h-5 text-red-500" />
                  )}
                </div>
                {errors.message && touched.message && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="fade-in-up" style={{animationDelay: '0.5s'}}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full apple-button flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <div className="spacer"></div>

      {/* Contact Methods */}
      <section className="apple-section bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="section-title text-center mb-16">Contact Methods</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Telegram Card */}
            <div 
              onClick={handleTelegramClick}
              className="product-card p-8 cursor-pointer clickable text-center"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl mb-4">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              
              <h3 className="text-lg font-semibold mb-3">Telegram</h3>
              <p className="text-gray-600 text-sm mb-4">
                Quick support
              </p>

              <div className="bg-gray-100 rounded-xl p-3 mb-4">
                <div className="text-xs text-gray-500 mb-1">Username</div>
                <div className="text-sm font-semibold text-gray-900">@Ahlan06</div>
              </div>

              <button className="apple-button-secondary w-full flex items-center justify-center gap-2 text-sm py-2">
                <Send size={16} />
                Open
              </button>
            </div>

            {/* Email Card */}
            <div 
              onClick={handleEmailClick}
              className="product-card p-8 cursor-pointer clickable text-center"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-4">
                <Mail className="w-7 h-7 text-white" />
              </div>
              
              <h3 className="text-lg font-semibold mb-3">Email</h3>
              <p className="text-gray-600 text-sm mb-4">
                Professional support
              </p>

              <div className="bg-gray-100 rounded-xl p-3 mb-4">
                <div className="text-xs text-gray-500 mb-1">Email Address</div>
                <div className="text-sm font-semibold text-gray-900 break-all">
                  ahlan.mira@icloud.com
                </div>
              </div>

              <button className="apple-button-secondary w-full flex items-center justify-center gap-2 text-sm py-2">
                <Mail size={16} />
                Send
              </button>
            </div>

            {/* GitHub Card */}
            <div 
              onClick={() => window.open('https://github.com/Ahlan06', '_blank')}
              className="product-card p-8 cursor-pointer clickable text-center"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl mb-4">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </div>
              
              <h3 className="text-lg font-semibold mb-3">GitHub</h3>
              <p className="text-gray-600 text-sm mb-4">
                View projects
              </p>

              <div className="bg-gray-100 rounded-xl p-3 mb-4">
                <div className="text-xs text-gray-500 mb-1">Profile</div>
                <div className="text-sm font-semibold text-gray-900">@Ahlan06</div>
              </div>

              <button className="apple-button-secondary w-full flex items-center justify-center gap-2 text-sm py-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                Visit
              </button>
            </div>

            {/* Twitter Card */}
            <div 
              onClick={() => window.open('https://twitter.com/AhlanMira', '_blank')}
              className="product-card p-8 cursor-pointer clickable text-center"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl mb-4">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </div>
              
              <h3 className="text-lg font-semibold mb-3">X</h3>
              <p className="text-gray-600 text-sm mb-4">
                Latest updates
              </p>

              <div className="bg-gray-100 rounded-xl p-3 mb-4">
                <div className="text-xs text-gray-500 mb-1">Handle</div>
                <div className="text-sm font-semibold text-gray-900">@AhlanMira</div>
              </div>

              <button className="apple-button-secondary w-full flex items-center justify-center gap-2 text-sm py-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Follow
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="spacer"></div>

      {/* Info Section */}
      <section className="apple-section">
        <div className="max-w-4xl mx-auto px-4">
          <div className="apple-card p-10 text-center">
            <h3 className="card-title mb-4">Support Hours</h3>
            <p className="text-gray-600 mb-8">
              We typically respond within 24 hours during business days
            </p>

            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="font-semibold text-gray-900 mb-1">Response Time</div>
                <div className="text-gray-600">{"< 24 hours"}</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="font-semibold text-gray-900 mb-1">Support Type</div>
                <div className="text-gray-600">Technical & Sales</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="font-semibold text-gray-900 mb-1">Languages</div>
                <div className="text-gray-600">English, Français</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Quick Links */}
      <section className="apple-section bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h3 className="card-title text-center mb-8">Common Questions</h3>
          
          <div className="space-y-4">
            <div className="apple-card p-6">
              <h4 className="font-semibold text-gray-900 mb-2">How do I receive my purchased products?</h4>
              <p className="text-gray-600">
                All digital products are delivered instantly via email after payment confirmation. 
                Check your spam folder if you don't see the email within 5 minutes.
              </p>
            </div>

            <div className="apple-card p-6">
              <h4 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h4>
              <p className="text-gray-600">
                We accept credit cards (Visa, Mastercard) via Stripe and cryptocurrency payments.
              </p>
            </div>

            <div className="apple-card p-6">
              <h4 className="font-semibold text-gray-900 mb-2">Do you offer refunds?</h4>
              <p className="text-gray-600">
                Due to the nature of digital products, we don't offer refunds. However, we provide 
                full support to ensure you can use your purchases successfully.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="spacer"></div>
    </div>
  );
};

export default ContactPage;
