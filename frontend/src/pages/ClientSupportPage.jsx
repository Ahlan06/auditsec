import { AlertCircle, CheckCircle, Loader, Mail, MessageCircle, Send } from 'lucide-react';
import { useRef, useState } from 'react';

const ClientSupportPage = () => {
  const formRef = useRef();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | { type: 'error'|'config', message: string }

  const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace(/\/+$/, '');

  const handleTelegramClick = () => {
    window.open('https://t.me/Ahlan06', '_blank', 'noopener,noreferrer');
  };

  const handleEmailClick = () => {
    window.location.href = 'mailto:ahlan.mira@icloud.com';
  };

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
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const isFieldValid = (name) => touched[name] && !errors[name] && formData[name];
  const isFieldInvalid = (name) => touched[name] && errors[name];

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.keys(formData).forEach((key) => {
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
      const payload = new FormData(formRef.current);

      const resp = await fetch(`${apiBase}/support/contact`, {
        method: 'POST',
        body: payload,
      });

      const data = await resp.json().catch(() => null);
      if (!resp.ok) {
        const message =
          data?.message ||
          data?.error ||
          `Failed to send message (HTTP ${resp.status}).`;
        setSubmitStatus({ type: data?.error === 'MAIL_NOT_CONFIGURED' ? 'config' : 'error', message });
        setTimeout(() => setSubmitStatus(null), 7000);
        return;
      }

      const attachmentSummary = Array.isArray(data?.sent?.attachments)
        ? ` (attachments received: ${data.sent.attachments.length})`
        : '';

      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTouched({});
      setErrors({});
      if (formRef.current) formRef.current.reset();
      setTimeout(() => setSubmitStatus(null), 5000);
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: error?.message || 'Failed to send message. Make sure the backend API is running.',
      });
      setTimeout(() => setSubmitStatus(null), 6000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      {submitStatus ? (
        <div
          className={
            'apple-card border backdrop-blur-lg max-w-2xl ' +
            (submitStatus === 'success'
              ? 'border-green-500/20 bg-green-500/5'
              : 'border-red-500/20 bg-red-500/5')
          }
        >
          <div className="flex items-start gap-3">
            {submitStatus === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
            )}
            <div className="min-w-0">
              <div
                className={
                  'text-sm font-semibold ' +
                  (submitStatus === 'success' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300')
                }
              >
                {submitStatus === 'success' ? 'Message sent successfully' : 'Message failed'}
              </div>
              {submitStatus !== 'success' ? (
                <div className="mt-1 text-xs text-red-700/80 dark:text-red-300/80">
                  {typeof submitStatus === 'object'
                    ? submitStatus.message
                    : 'Check console (F12) or contact via Telegram/Email.'}
                </div>
              ) : (
                <div className="mt-1 text-xs text-green-700/80 dark:text-green-300/80">
                  We’ll reply as soon as possible.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <div>
        <h1 className="section-title">Support</h1>
        <div className="apple-card p-6">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Need help? Send a message (with attachments) or contact us via Telegram or Email.
          </p>
        </div>
      </div>

      {/* Email form with attachments */}
      <div className="apple-card p-10">
        <h2 className="card-title mb-8 text-center">Send us a message</h2>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Email *
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                name="from_email"
                value={formData.email}
                onChange={(e) => handleChange({ target: { name: 'email', value: e.target.value } })}
                onBlur={(e) => handleBlur({ target: { name: 'email', value: e.target.value } })}
                className={
                  'w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 outline-none bg-white dark:bg-black text-gray-900 dark:text-gray-100 ' +
                  (isFieldInvalid('email')
                    ? 'border-red-300 focus:border-red-500'
                    : isFieldValid('email')
                      ? 'border-green-300 focus:border-green-500'
                      : 'border-gray-200 dark:border-white/10 focus:border-blue-500')
                }
                placeholder="you@company.com"
              />
              {isFieldValid('email') ? (
                <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
              ) : null}
            </div>
            {isFieldInvalid('email') ? <p className="mt-2 text-sm text-red-600">{errors.email}</p> : null}
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Name *
            </label>
            <div className="relative">
              <input
                type="text"
                id="name"
                name="from_name"
                value={formData.name}
                onChange={(e) => handleChange({ target: { name: 'name', value: e.target.value } })}
                onBlur={(e) => handleBlur({ target: { name: 'name', value: e.target.value } })}
                className={
                  'w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 outline-none bg-white dark:bg-black text-gray-900 dark:text-gray-100 ' +
                  (isFieldInvalid('name')
                    ? 'border-red-300 focus:border-red-500'
                    : isFieldValid('name')
                      ? 'border-green-300 focus:border-green-500'
                      : 'border-gray-200 dark:border-white/10 focus:border-blue-500')
                }
                placeholder="John Doe"
              />
              {isFieldValid('name') ? (
                <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
              ) : null}
            </div>
            {isFieldInvalid('name') ? <p className="mt-2 text-sm text-red-600">{errors.name}</p> : null}
          </div>

          {/* Subject */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Subject *
            </label>
            <div className="relative">
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={(e) => handleChange({ target: { name: 'subject', value: e.target.value } })}
                onBlur={(e) => handleBlur({ target: { name: 'subject', value: e.target.value } })}
                className={
                  'w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 outline-none bg-white dark:bg-black text-gray-900 dark:text-gray-100 ' +
                  (isFieldInvalid('subject')
                    ? 'border-red-300 focus:border-red-500'
                    : isFieldValid('subject')
                      ? 'border-green-300 focus:border-green-500'
                      : 'border-gray-200 dark:border-white/10 focus:border-blue-500')
                }
                placeholder="How can we help?"
              />
              {isFieldValid('subject') ? (
                <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
              ) : null}
            </div>
            {isFieldInvalid('subject') ? <p className="mt-2 text-sm text-red-600">{errors.subject}</p> : null}
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Message *
            </label>
            <div className="relative">
              <textarea
                id="message"
                name="message"
                rows={6}
                value={formData.message}
                onChange={(e) => handleChange({ target: { name: 'message', value: e.target.value } })}
                onBlur={(e) => handleBlur({ target: { name: 'message', value: e.target.value } })}
                className={
                  'w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 outline-none bg-white dark:bg-black text-gray-900 dark:text-gray-100 ' +
                  (isFieldInvalid('message')
                    ? 'border-red-300 focus:border-red-500'
                    : isFieldValid('message')
                      ? 'border-green-300 focus:border-green-500'
                      : 'border-gray-200 dark:border-white/10 focus:border-blue-500')
                }
                placeholder="Describe your issue and include relevant URLs, screenshots, or steps to reproduce."
              />
            </div>
            {isFieldInvalid('message') ? <p className="mt-2 text-sm text-red-600">{errors.message}</p> : null}
          </div>

          {/* Attachments */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Attachments</label>
              <span className="text-xs text-gray-500 dark:text-gray-400">Files / photos (up to 3)</span>
            </div>
            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <input
                type="file"
                name="attachment_1"
                accept="image/*,.pdf,.txt,.log,.zip"
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black px-4 py-3 text-sm text-gray-900 dark:text-gray-100"
              />
              <input
                type="file"
                name="attachment_2"
                accept="image/*,.pdf,.txt,.log,.zip"
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black px-4 py-3 text-sm text-gray-900 dark:text-gray-100"
              />
              <input
                type="file"
                name="attachment_3"
                accept="image/*,.pdf,.txt,.log,.zip"
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black px-4 py-3 text-sm text-gray-900 dark:text-gray-100"
              />
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Attachments are sent by the backend mailer (real email attachments).
            </div>
          </div>

          <div className="flex items-center justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="apple-button-primary flex items-center justify-center gap-2 px-8 py-3 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send message
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Contact Methods — copied to match Contact page */}
      <section className="apple-card p-0 overflow-hidden">
        <div className="bg-gray-50 dark:bg-white/5 p-8">
          <h2 className="section-title text-center mb-10">Contact Methods</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Telegram Card */}
            <div onClick={handleTelegramClick} className="product-card p-8 cursor-pointer clickable text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl mb-4">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-3">Telegram</h3>
              <p className="text-gray-600 text-sm mb-4">Quick support</p>
              <div className="bg-gray-100 rounded-xl p-3 mb-4">
                <div className="text-xs text-gray-500 mb-1">Username</div>
                <div className="text-sm font-semibold text-gray-900">@Ahlan06</div>
              </div>
              <button type="button" className="apple-button-secondary w-full flex items-center justify-center gap-2 text-sm py-2">
                <Send size={16} />
                Open
              </button>
            </div>

            {/* Email Card */}
            <div onClick={handleEmailClick} className="product-card p-8 cursor-pointer clickable text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-4">
                <Mail className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-3">Email</h3>
              <p className="text-gray-600 text-sm mb-4">Professional support</p>
              <div className="bg-gray-100 rounded-xl p-3 mb-4">
                <div className="text-xs text-gray-500 mb-1">Email Address</div>
                <div
                  className="w-full text-xs font-semibold text-gray-900 truncate"
                  title="ahlan.mira@icloud.com"
                >
                  ahlan.mira@icloud.com
                </div>
              </div>
              <button type="button" className="apple-button-secondary w-full flex items-center justify-center gap-2 text-sm py-2">
                <Mail size={16} />
                Send
              </button>
            </div>

            {/* GitHub Card */}
            <div
              onClick={() => window.open('https://github.com/Ahlan06', '_blank', 'noopener,noreferrer')}
              className="product-card p-8 cursor-pointer clickable text-center"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl mb-4">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-3">GitHub</h3>
              <p className="text-gray-600 text-sm mb-4">View projects</p>
              <div className="bg-gray-100 rounded-xl p-3 mb-4">
                <div className="text-xs text-gray-500 mb-1">Profile</div>
                <div className="text-sm font-semibold text-gray-900">@Ahlan06</div>
              </div>
              <button type="button" className="apple-button-secondary w-full flex items-center justify-center gap-2 text-sm py-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                Visit
              </button>
            </div>

            {/* X Card */}
            <div
              onClick={() => window.open('https://twitter.com/AhlanMira', '_blank', 'noopener,noreferrer')}
              className="product-card p-8 cursor-pointer clickable text-center"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl mb-4">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-3">X</h3>
              <p className="text-gray-600 text-sm mb-4">Latest updates</p>
              <div className="bg-gray-100 rounded-xl p-3 mb-4">
                <div className="text-xs text-gray-500 mb-1">Handle</div>
                <div className="text-sm font-semibold text-gray-900">@AhlanMira</div>
              </div>
              <button type="button" className="apple-button-secondary w-full flex items-center justify-center gap-2 text-sm py-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Follow
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ClientSupportPage;
