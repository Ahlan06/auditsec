import { useEffect, useMemo, useRef, useState } from 'react';
import useThemeStore from '../store/themeStore';
import { ErrorState, ProfileSkeleton } from '../components/client-dashboard/ui';

const STORAGE_KEY = 'auditsec_client_profile_v1';

const safeParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const nowIso = () => new Date().toISOString();

const initialState = {
  personal: {
    photoDataUrl: '',
    firstName: 'Alex',
    lastName: 'Morgan',
    email: 'client@auditsec',
    emailVerified: false,
    emailVerificationPending: false,
    phone: '',
    company: '',
    role: 'Security Analyst',
    bio: '',
  },
  security: {
    twoFA: {
      googleAuthenticator: false,
      sms: false,
      email: true,
    },
    securityAlerts: {
      newLogin: true,
      passwordChanged: true,
      twoFAChanged: true,
      suspiciousActivity: true,
    },
    sessions: [
      {
        id: 'sess-current',
        device: 'Windows • Chrome',
        location: 'Paris, FR',
        ip: '192.168.1.24',
        lastActiveIso: nowIso(),
        current: true,
      },
      {
        id: 'sess-2',
        device: 'macOS • Safari',
        location: 'Lyon, FR',
        ip: '203.0.113.10',
        lastActiveIso: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(),
        current: false,
      },
    ],
    loginHistory: [
      {
        id: 'lh-1',
        dateIso: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
        event: 'Successful login',
        location: 'Paris, FR',
        ip: '192.168.1.24',
      },
      {
        id: 'lh-2',
        dateIso: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(),
        event: 'Successful login',
        location: 'Lyon, FR',
        ip: '203.0.113.10',
      },
    ],
  },
  notifications: {
    emailDaily: false,
    emailReports: true,
    emailAlerts: true,
    pushNotifications: false,
    reportFrequency: 'Weekly',
    alertThresholds: {
      criticalOnly: false,
      minSeverity: 'Medium',
      maxOpenFindings: 25,
    },
  },
  preferences: {
    language: 'English (US)',
    timeZone: 'Europe/Paris',
    dateFormat: 'MMM DD, YYYY',
    quickAccess: {
      dashboard: true,
      audits: true,
      reports: true,
      security: false,
    },
  },
};

const tabs = [
  { key: 'personal', label: 'Personal info' },
  { key: 'security', label: 'Security' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'preferences', label: 'Preferences' },
];

function formatDateTime(iso) {
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function Toggle({ enabled, onChange, label, description }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</div>
        {description ? <div className="text-xs text-gray-500 dark:text-gray-400">{description}</div> : null}
      </div>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={
          'h-7 w-12 rounded-full border transition-colors ' +
          (enabled
            ? 'bg-blue-600 border-blue-600'
            : 'bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-700')
        }
        aria-label={label}
      >
        <span
          className={
            'block h-6 w-6 rounded-full bg-white dark:bg-black shadow-sm transform transition-transform ' +
            (enabled ? 'translate-x-5' : 'translate-x-0.5')
          }
        />
      </button>
    </div>
  );
}

function Field({ label, children, hint }) {
  return (
    <div>
      <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">{label}</div>
      {children}
      {hint ? <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</div> : null}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input
      type={type}
      className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black px-3 py-2 text-sm"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function Textarea({ value, onChange, placeholder }) {
  return (
    <textarea
      className="w-full min-h-[96px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black px-3 py-2 text-sm"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function Pill({ text, tone = 'neutral' }) {
  const cls =
    tone === 'success'
      ? 'bg-green-500/10 text-green-700 dark:text-green-300 border border-green-500/20'
      : tone === 'warning'
        ? 'bg-yellow-500/10 text-yellow-800 dark:text-yellow-200 border border-yellow-500/20'
        : tone === 'danger'
          ? 'bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20'
          : 'bg-gray-500/10 text-gray-700 dark:text-gray-300 border border-gray-500/20';

  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{text}</span>;
}

export default function ClientProfilePage() {
  const { isDarkMode, toggleTheme } = useThemeStore();

  const [hydrating, setHydrating] = useState(true);
  const [dataIssue, setDataIssue] = useState('');

  const [activeTab, setActiveTab] = useState('personal');
  const [state, setState] = useState(initialState);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  // Security forms
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const fileInputRef = useRef(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? safeParse(raw) : null;
      if (raw && !parsed) {
        setDataIssue('Stored profile data could not be parsed.');
        return;
      }
      if (parsed && typeof parsed === 'object') {
        setState((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      setDataIssue('Profile data is unavailable.');
    } finally {
      setHydrating(false);
    }
  }, []);

  useEffect(() => {
    if (hydrating || dataIssue) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state, hydrating, dataIssue]);

  const emailStatus = useMemo(() => {
    if (state.personal.emailVerified) return { label: 'Verified', tone: 'success' };
    if (state.personal.emailVerificationPending) return { label: 'Verification sent', tone: 'warning' };
    return { label: 'Not verified', tone: 'danger' };
  }, [state.personal.emailVerified, state.personal.emailVerificationPending]);

  const setPersonal = (patch) => setState((prev) => ({ ...prev, personal: { ...prev.personal, ...patch } }));
  const setSecurity = (patch) => setState((prev) => ({ ...prev, security: { ...prev.security, ...patch } }));
  const setNotifications = (patch) => setState((prev) => ({ ...prev, notifications: { ...prev.notifications, ...patch } }));
  const setPreferences = (patch) => setState((prev) => ({ ...prev, preferences: { ...prev.preferences, ...patch } }));

  const showNotice = (text) => {
    setNotice(text);
    setError('');
    window.setTimeout(() => setNotice(''), 2500);
  };

  const showError = (text) => {
    setError(text);
    setNotice('');
    window.setTimeout(() => setError(''), 3500);
  };

  const resetProfile = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setState(initialState);
    setActiveTab('personal');
    setDataIssue('');
    showNotice('Profile reset.');
  };

  const onUploadPhoto = async (file) => {
    if (!file) return;
    if (!file.type?.startsWith('image/')) {
      showError('Please select an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      setPersonal({ photoDataUrl: dataUrl });
      showNotice('Profile photo updated.');
    };
    reader.onerror = () => showError('Failed to read the file.');
    reader.readAsDataURL(file);
  };

  const sendEmailVerification = () => {
    if (!state.personal.email) {
      showError('Please enter an email first.');
      return;
    }
    setPersonal({ emailVerificationPending: true });
    showNotice('Verification email sent (demo).');

    // Demo: auto-verify after a short delay.
    window.setTimeout(() => {
      setPersonal({ emailVerified: true, emailVerificationPending: false });
    }, 1200);
  };

  const savePersonal = () => {
    if (!state.personal.firstName.trim() || !state.personal.lastName.trim()) {
      showError('First name and last name are required.');
      return;
    }
    if (!state.personal.email.trim()) {
      showError('Email is required.');
      return;
    }
    showNotice('Personal info saved.');
  };

  const changePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showError('Please fill in all password fields.');
      return;
    }
    if (newPassword.length < 8) {
      showError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showError('New password and confirmation do not match.');
      return;
    }

    // Demo only
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setSecurity((prev) => ({
      ...prev,
      loginHistory: [
        {
          id: `lh-${Date.now()}`,
          dateIso: nowIso(),
          event: 'Password changed',
          location: '—',
          ip: '—',
        },
        ...prev.loginHistory,
      ],
    }));
    showNotice('Password updated (demo).');
  };

  const toggleTwoFA = (key, enabled) => {
    setSecurity({
      twoFA: { ...state.security.twoFA, [key]: enabled },
    });
    showNotice('2FA settings updated.');
  };

  const revokeSession = (sessionId) => {
    const target = state.security.sessions.find((s) => s.id === sessionId);
    if (!target) return;
    if (target.current) {
      showError('You cannot revoke the current session here (demo).');
      return;
    }

    setSecurity({ sessions: state.security.sessions.filter((s) => s.id !== sessionId) });
    showNotice('Session revoked.');
  };

  const updateSecurityAlert = (key, enabled) => {
    setSecurity({ securityAlerts: { ...state.security.securityAlerts, [key]: enabled } });
    showNotice('Security alerts updated.');
  };

  const updateQuickAccess = (key, enabled) => {
    setPreferences({ quickAccess: { ...state.preferences.quickAccess, [key]: enabled } });
    showNotice('Quick access updated.');
  };

  const onToggleThemePreference = () => {
    toggleTheme();
    showNotice(`Theme set to ${!isDarkMode ? 'Dark' : 'Light'}.`);
  };

  const TabButton = ({ tabKey, label }) => {
    const active = activeTab === tabKey;
    return (
      <button
        type="button"
        onClick={() => setActiveTab(tabKey)}
        className={
          'rounded-lg px-3 py-2 text-sm border transition-colors ' +
          (active
            ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100'
            : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800')
        }
      >
        {label}
      </button>
    );
  };

  if (hydrating) {
    return <ProfileSkeleton />;
  }

  if (dataIssue) {
    return (
      <div className="space-y-4">
        <div className="apple-card">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">Profile</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Manage your profile information, security, notifications, and preferences.
          </p>
        </div>
        <ErrorState
          kind="missing"
          title="Missing profile data"
          details={dataIssue}
          onRetry={resetProfile}
          actionLabel="Reset profile"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="apple-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">Profile</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Manage your profile information, security, notifications, and preferences.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {notice && <div className="text-sm text-green-700 dark:text-green-300">{notice}</div>}
            {error && <div className="text-sm text-red-600 dark:text-red-300">{error}</div>}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <TabButton key={t.key} tabKey={t.key} label={t.label} />
          ))}
        </div>
      </div>

      {activeTab === 'personal' && (
        <div className="apple-card">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Personal information</div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Update your identity and contact details.</div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
            {/* Photo */}
            <div className="lg:col-span-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Profile photo</div>
              <div className="mt-3 flex items-center gap-3">
                <div className="h-16 w-16 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                  {state.personal.photoDataUrl ? (
                    <img src={state.personal.photoDataUrl} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                      {state.personal.firstName?.[0] || 'C'}
                      {state.personal.lastName?.[0] || 'P'}
                    </span>
                  )}
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Upload
                  </button>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF</div>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onUploadPhoto(e.target.files?.[0] || null)}
              />
            </div>

            {/* Fields */}
            <div className="lg:col-span-8 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="First name">
                  <Input value={state.personal.firstName} onChange={(v) => setPersonal({ firstName: v })} placeholder="First name" />
                </Field>
                <Field label="Last name">
                  <Input value={state.personal.lastName} onChange={(v) => setPersonal({ lastName: v })} placeholder="Last name" />
                </Field>

                <Field
                  label="Email"
                  hint="Email verification is a demo flow until backend wiring is added."
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="flex-1">
                      <Input value={state.personal.email} onChange={(v) => setPersonal({ email: v, emailVerified: false, emailVerificationPending: false })} placeholder="Email" type="email" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Pill text={emailStatus.label} tone={emailStatus.tone} />
                      <button
                        type="button"
                        onClick={sendEmailVerification}
                        disabled={state.personal.emailVerified || state.personal.emailVerificationPending}
                        className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                      >
                        Verify
                      </button>
                    </div>
                  </div>
                </Field>

                <Field label="Phone">
                  <Input value={state.personal.phone} onChange={(v) => setPersonal({ phone: v })} placeholder="+1 555 000 000" />
                </Field>

                <Field label="Company (optional)">
                  <Input value={state.personal.company} onChange={(v) => setPersonal({ company: v })} placeholder="Company" />
                </Field>

                <Field label="Role">
                  <Input value={state.personal.role} onChange={(v) => setPersonal({ role: v })} placeholder="Role" />
                </Field>

                <div className="sm:col-span-2">
                  <Field label="Bio">
                    <Textarea value={state.personal.bio} onChange={(v) => setPersonal({ bio: v })} placeholder="Short bio…" />
                  </Field>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={savePersonal}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-4">
          {/* Password */}
          <div className="apple-card">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Password</div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Change your account password.</div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label="Current password">
                <Input value={currentPassword} onChange={setCurrentPassword} placeholder="••••••••" type="password" />
              </Field>
              <Field label="New password">
                <Input value={newPassword} onChange={setNewPassword} placeholder="At least 8 characters" type="password" />
              </Field>
              <Field label="Confirm new password">
                <Input value={confirmPassword} onChange={setConfirmPassword} placeholder="Repeat new password" type="password" />
              </Field>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={changePassword}
                className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Update password
              </button>
            </div>
          </div>

          {/* 2FA */}
          <div className="apple-card">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Two-factor authentication (2FA)</div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Enable additional verification methods.</div>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
                <Toggle
                  enabled={state.security.twoFA.googleAuthenticator}
                  onChange={(v) => toggleTwoFA('googleAuthenticator', v)}
                  label="Google Authenticator"
                  description="Time-based OTP (TOTP)."
                />
              </div>
              <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
                <Toggle
                  enabled={state.security.twoFA.sms}
                  onChange={(v) => toggleTwoFA('sms', v)}
                  label="SMS"
                  description="Receive codes via SMS."
                />
              </div>
              <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
                <Toggle
                  enabled={state.security.twoFA.email}
                  onChange={(v) => toggleTwoFA('email', v)}
                  label="Email"
                  description="Receive codes by email."
                />
              </div>
            </div>
          </div>

          {/* Sessions + history */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="lg:col-span-7 apple-card">
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Active sessions</div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Review and remotely sign out sessions.</div>

              <div className="mt-4 space-y-2">
                {state.security.sessions.map((s) => (
                  <div key={s.id} className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{s.device}</div>
                          {s.current ? <Pill text="Current" /> : null}
                        </div>
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {s.location} • {s.ip} • Last active: {formatDateTime(s.lastActiveIso)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => revokeSession(s.id)}
                        className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 apple-card">
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Login history</div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Recent sign-in events.</div>

              <div className="mt-4 space-y-2">
                {state.security.loginHistory.map((e) => (
                  <div key={e.id} className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{e.event}</div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {formatDateTime(e.dateIso)} • {e.location} • {e.ip}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Security alerts */}
          <div className="apple-card">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Security alerts</div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Control which security alerts you receive.</div>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
                <Toggle
                  enabled={state.security.securityAlerts.newLogin}
                  onChange={(v) => updateSecurityAlert('newLogin', v)}
                  label="New login"
                  description="Alert when a new login is detected."
                />
              </div>
              <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
                <Toggle
                  enabled={state.security.securityAlerts.passwordChanged}
                  onChange={(v) => updateSecurityAlert('passwordChanged', v)}
                  label="Password changed"
                  description="Alert when your password is updated."
                />
              </div>
              <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
                <Toggle
                  enabled={state.security.securityAlerts.twoFAChanged}
                  onChange={(v) => updateSecurityAlert('twoFAChanged', v)}
                  label="2FA settings changed"
                  description="Alert when 2FA methods are modified."
                />
              </div>
              <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
                <Toggle
                  enabled={state.security.securityAlerts.suspiciousActivity}
                  onChange={(v) => updateSecurityAlert('suspiciousActivity', v)}
                  label="Suspicious activity"
                  description="Alert on unusual activity patterns."
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-4">
          <div className="apple-card">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Email preferences</div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Choose which emails you want to receive.</div>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
                <Toggle
                  enabled={state.notifications.emailDaily}
                  onChange={(v) => setNotifications({ emailDaily: v })}
                  label="Daily summaries"
                  description="Daily activity overview."
                />
              </div>
              <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
                <Toggle
                  enabled={state.notifications.emailReports}
                  onChange={(v) => setNotifications({ emailReports: v })}
                  label="Reports"
                  description="Notify when reports are generated."
                />
              </div>
              <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
                <Toggle
                  enabled={state.notifications.emailAlerts}
                  onChange={(v) => setNotifications({ emailAlerts: v })}
                  label="Security alerts"
                  description="Critical alerts and incidents."
                />
              </div>
            </div>
          </div>

          <div className="apple-card">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Push notifications</div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Enable notifications in supported browsers.</div>

            <div className="mt-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
              <Toggle
                enabled={state.notifications.pushNotifications}
                onChange={(v) => setNotifications({ pushNotifications: v })}
                label="Push notifications"
                description="Requires browser permission (demo)."
              />
            </div>
          </div>

          <div className="apple-card">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Reports & thresholds</div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Control report cadence and alert thresholds.</div>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
              <div className="lg:col-span-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
                <Field label="Report frequency">
                  <select
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black px-3 py-2 text-sm"
                    value={state.notifications.reportFrequency}
                    onChange={(e) => setNotifications({ reportFrequency: e.target.value })}
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                  </select>
                </Field>
              </div>

              <div className="lg:col-span-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
                <Toggle
                  enabled={state.notifications.alertThresholds.criticalOnly}
                  onChange={(v) =>
                    setNotifications({
                      alertThresholds: { ...state.notifications.alertThresholds, criticalOnly: v },
                    })
                  }
                  label="Critical only"
                  description="Only alert for critical severity."
                />
              </div>

              <div className="lg:col-span-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
                <Field label="Minimum severity">
                  <select
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black px-3 py-2 text-sm"
                    value={state.notifications.alertThresholds.minSeverity}
                    onChange={(e) =>
                      setNotifications({
                        alertThresholds: { ...state.notifications.alertThresholds, minSeverity: e.target.value },
                      })
                    }
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </Field>
              </div>

              <div className="lg:col-span-12 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
                <Field label="Alert threshold: max open findings" hint="When exceeded, you receive an alert.">
                  <input
                    type="number"
                    min={0}
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black px-3 py-2 text-sm"
                    value={state.notifications.alertThresholds.maxOpenFindings}
                    onChange={(e) =>
                      setNotifications({
                        alertThresholds: {
                          ...state.notifications.alertThresholds,
                          maxOpenFindings: Number(e.target.value || 0),
                        },
                      })
                    }
                  />
                </Field>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'preferences' && (
        <div className="space-y-4">
          <div className="apple-card">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">General preferences</div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Customize your experience.</div>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
              <div className="lg:col-span-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
                <Field label="Language">
                  <select
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black px-3 py-2 text-sm"
                    value={state.preferences.language}
                    onChange={(e) => setPreferences({ language: e.target.value })}
                  >
                    <option value="English (US)">English (US)</option>
                    <option value="English (UK)">English (UK)</option>
                    <option value="French (FR)">French (FR)</option>
                  </select>
                </Field>
              </div>

              <div className="lg:col-span-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
                <Field label="Time zone">
                  <select
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black px-3 py-2 text-sm"
                    value={state.preferences.timeZone}
                    onChange={(e) => setPreferences({ timeZone: e.target.value })}
                  >
                    <option value="Europe/Paris">Europe/Paris</option>
                    <option value="Europe/London">Europe/London</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="Asia/Dubai">Asia/Dubai</option>
                  </select>
                </Field>
              </div>

              <div className="lg:col-span-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
                <Field label="Date format">
                  <select
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black px-3 py-2 text-sm"
                    value={state.preferences.dateFormat}
                    onChange={(e) => setPreferences({ dateFormat: e.target.value })}
                  >
                    <option value="MMM DD, YYYY">MMM DD, YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </Field>
              </div>

              <div className="lg:col-span-12 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
                <Toggle
                  enabled={isDarkMode}
                  onChange={onToggleThemePreference}
                  label="Dark mode"
                  description="Toggle light/dark appearance."
                />
              </div>
            </div>
          </div>

          <div className="apple-card">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Quick access</div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Choose what appears in your shortcuts.</div>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
                <Toggle
                  enabled={state.preferences.quickAccess.dashboard}
                  onChange={(v) => updateQuickAccess('dashboard', v)}
                  label="Dashboard"
                  description="Quick link to your dashboard."
                />
              </div>
              <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
                <Toggle
                  enabled={state.preferences.quickAccess.audits}
                  onChange={(v) => updateQuickAccess('audits', v)}
                  label="Audits"
                  description="Quick link to audits pages."
                />
              </div>
              <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
                <Toggle
                  enabled={state.preferences.quickAccess.reports}
                  onChange={(v) => updateQuickAccess('reports', v)}
                  label="Reports"
                  description="Quick link to the reports manager."
                />
              </div>
              <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
                <Toggle
                  enabled={state.preferences.quickAccess.security}
                  onChange={(v) => updateQuickAccess('security', v)}
                  label="Security"
                  description="Quick link to security overview."
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
