import { useEffect, useMemo, useState } from 'react';
import { FiCheck } from 'react-icons/fi';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { isApiConfigured, paymentAPI } from '../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const STORAGE_KEY = 'auditsec_client_subscription_v1';

const safeParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const decodeBase64Url = (value) => {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  return atob(padded);
};

const decodeClientToken = (token) => {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const json = decodeBase64Url(parts[1]);
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const formatDate = (iso) => {
  try {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(new Date(iso));
  } catch {
    return iso;
  }
};

const money = (amount, currency = 'EUR') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);

const plans = [
  {
    key: 'Free',
    priceMonthly: 0,
    trialDays: 0,
    features: ['Client portal access', 'Basic reports', 'Email alerts'],
    limits: { auditsPerMonth: 2, storageGb: 1, scansPerMonth: 5 },
  },
  {
    key: 'Pro',
    priceMonthly: 49,
    trialDays: 14,
    features: ['Unlimited client portal', 'Advanced reports', 'Priority support', 'Monitoring & alerts'],
    limits: { auditsPerMonth: 20, storageGb: 50, scansPerMonth: 200 },
  },
  {
    key: 'Enterprise',
    priceMonthly: 299,
    trialDays: 14,
    features: ['Team access', 'Executive templates', 'SLA support', 'SSO-ready (planned)'],
    limits: { auditsPerMonth: 200, storageGb: 500, scansPerMonth: 2000 },
  },
];

const invoiceSeed = [
  { id: 'inv-1003', dateIso: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), amount: 49, status: 'Paid' },
  { id: 'inv-1002', dateIso: new Date(Date.now() - 1000 * 60 * 60 * 24 * 38).toISOString(), amount: 49, status: 'Paid' },
  { id: 'inv-1001', dateIso: new Date(Date.now() - 1000 * 60 * 60 * 24 * 68).toISOString(), amount: 0, status: 'Free' },
];

const initialState = {
  currentPlan: 'Pro',
  startIso: new Date(Date.now() - 1000 * 60 * 60 * 24 * 22).toISOString(),
  endIso: new Date(Date.now() + 1000 * 60 * 60 * 24 * 8).toISOString(),
  invoices: invoiceSeed,
  billing: {
    autoBilling: true,
    cardBrand: 'Visa',
    last4: '4242',
    exp: '12/28',
  },
  enterpriseCalculator: {
    seats: 10,
    ratePerSeat: 25,
    baseFee: 199,
  },
  usage: {
    monthLabel: new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date()),
    auditsUsed: 8,
    storageUsedGb: 12.4,
    scansUsed: 94,
    history: [
      { id: 'u-1', dateIso: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), audits: 1, scans: 6, storageGbDelta: 0.6 },
      { id: 'u-2', dateIso: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(), audits: 2, scans: 12, storageGbDelta: 1.8 },
      { id: 'u-3', dateIso: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(), audits: 1, scans: 20, storageGbDelta: 2.1 },
    ],
  },
};

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

function Progress({ label, used, limit, unit, hint }) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const warning = pct >= 80;
  const danger = pct >= 100;

  const bar = danger ? 'bg-red-500' : warning ? 'bg-yellow-500' : 'bg-blue-600';

  return (
    <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</div>
          {hint ? <div className="text-xs text-gray-500 dark:text-gray-400">{hint}</div> : null}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{used}{unit} / {limit}{unit}</div>
      </div>
      <div className="mt-3 h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
        <div className={`h-full ${bar}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div className="text-xs text-gray-500 dark:text-gray-400">{pct}%</div>
        {danger ? <Pill text="Limit exceeded" tone="danger" /> : warning ? <Pill text="Approaching limit" tone="warning" /> : null}
      </div>
    </div>
  );
}

function downloadText({ filename, text }) {
  const blob = new Blob([text], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function ClientSubscriptionPage() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('client_token') : null;
  const email = useMemo(() => decodeClientToken(token)?.email || 'client@auditsec', [token]);

  const [state, setState] = useState(initialState);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [upgradePlan, setUpgradePlan] = useState('Pro');
  const [editingPayment, setEditingPayment] = useState(false);

  const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? safeParse(raw) : null;
    if (parsed && typeof parsed === 'object') {
      setState((prev) => ({ ...prev, ...parsed }));
      if (parsed.currentPlan) setUpgradePlan(parsed.currentPlan);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const currentPlan = useMemo(() => plans.find((p) => p.key === state.currentPlan) || plans[0], [state.currentPlan]);

  const enterpriseMonthly = useMemo(() => {
    const { seats, ratePerSeat, baseFee } = state.enterpriseCalculator;
    return Math.max(0, baseFee + seats * ratePerSeat);
  }, [state.enterpriseCalculator]);

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

  const onChangePlan = (planKey) => {
    setUpgradePlan(planKey);
    showNotice('Plan selection updated.');
  };

  const onDownloadInvoice = (inv) => {
    downloadText({
      filename: `${inv.id}.pdf`,
      text: `Invoice ${inv.id}\nDate: ${formatDate(inv.dateIso)}\nAmount: ${money(inv.amount)}\nStatus: ${inv.status}\n\n(Placeholder PDF content)`
    });
  };

  const savePayment = (patch) => {
    setState((prev) => ({ ...prev, billing: { ...prev.billing, ...patch } }));
  };

  const toggleAutoBilling = () => {
    setState((prev) => ({ ...prev, billing: { ...prev.billing, autoBilling: !prev.billing.autoBilling } }));
    showNotice('Billing settings updated.');
  };

  const upgradeWithStripe = async () => {
    setError('');
    setNotice('');

    const target = plans.find((p) => p.key === upgradePlan) || plans[1];
    if (target.key === state.currentPlan) {
      showError('You are already on this plan.');
      return;
    }

    if (!isApiConfigured) {
      showError('Upgrade is disabled in demo mode (API not configured).');
      return;
    }

    if (!stripePublicKey) {
      showError('Stripe is not configured for this deployment.');
      return;
    }

    if (!window.Stripe) {
      showError('Stripe.js is not available.');
      return;
    }

    const price =
      target.key === 'Enterprise'
        ? enterpriseMonthly
        : target.priceMonthly;

    const items = [
      {
        productId: `subscription_${target.key.toLowerCase()}`,
        name: `Subscription — ${target.key}`,
        description: 'Subscription plan upgrade',
        price,
        quantity: 1,
      },
    ];

    try {
      const { sessionId } = await paymentAPI.createStripeSession(items, email);
      const stripe = window.Stripe(stripePublicKey);
      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });
      if (stripeError) throw new Error(stripeError.message);
    } catch (err) {
      showError(err?.message || 'Failed to start Stripe Checkout');
    }
  };

  const applyPlanLocally = () => {
    // Demo-only local change.
    setState((prev) => ({
      ...prev,
      currentPlan: upgradePlan,
      startIso: new Date().toISOString(),
      endIso: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
      invoices: [
        {
          id: `inv-${Math.floor(1000 + Math.random() * 9000)}`,
          dateIso: new Date().toISOString(),
          amount: (plans.find((p) => p.key === upgradePlan)?.key === 'Enterprise' ? enterpriseMonthly : plans.find((p) => p.key === upgradePlan)?.priceMonthly) || 0,
          status: 'Paid',
        },
        ...prev.invoices,
      ],
    }));
    showNotice('Plan updated (demo).');
  };

  const usageLabels = useMemo(() => {
    const out = [];
    const base = new Date();
    for (let i = 14; i >= 0; i -= 1) {
      const d = new Date(base.getTime() - i * 24 * 60 * 60 * 1000);
      out.push(new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit' }).format(d));
    }
    return out;
  }, []);

  const usageChart = useMemo(() => {
    const audits = usageLabels.map((_, idx) => {
      // gentle wave
      const v = 1 + Math.round(Math.abs(Math.sin(idx / 3)) * 2);
      return idx % 5 === 0 ? v + 1 : v;
    });
    const scans = usageLabels.map((_, idx) => 4 + Math.round(Math.abs(Math.cos(idx / 3)) * 10));

    return {
      data: {
        labels: usageLabels,
        datasets: [
          {
            label: 'Audits',
            data: audits,
            borderColor: 'rgba(59, 130, 246, 0.9)',
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            tension: 0.35,
            pointRadius: 2,
          },
          {
            label: 'Scans',
            data: scans,
            borderColor: 'rgba(16, 185, 129, 0.9)',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            tension: 0.35,
            pointRadius: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#9CA3AF' } },
        },
        scales: {
          x: { ticks: { color: '#9CA3AF' }, grid: { color: 'rgba(255,255,255,0.06)' } },
          y: { ticks: { color: '#9CA3AF' }, grid: { color: 'rgba(255,255,255,0.06)' } },
        },
      },
    };
  }, [usageLabels]);

  return (
    <div className="space-y-4">
      <div className="apple-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">Subscription</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Manage your plan, billing, upgrades, and usage.</p>
          </div>
          <div className="flex items-center gap-3">
            {notice && <div className="text-sm text-green-700 dark:text-green-300">{notice}</div>}
            {error && <div className="text-sm text-red-600 dark:text-red-300">{error}</div>}
          </div>
        </div>
      </div>

      {/* Current subscription */}
      <div className="apple-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Current subscription</div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Your current plan and included features.</div>
          </div>
          <button
            type="button"
            onClick={() => showNotice('Scroll down to the Upgrade section to change your plan.')}
            className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Change plan
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
            <div className="text-xs text-gray-500 dark:text-gray-400">Plan</div>
            <div className="mt-1 flex items-center gap-2">
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{currentPlan.key}</div>
              {currentPlan.trialDays > 0 ? <Pill text={`${currentPlan.trialDays}-day trial`} tone="neutral" /> : null}
            </div>
            <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">Start: {formatDate(state.startIso)}</div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">End: {formatDate(state.endIso)}</div>
            <div className="mt-3 text-sm font-medium text-gray-900 dark:text-gray-100">{money(currentPlan.priceMonthly)}/mo</div>
          </div>

          <div className="lg:col-span-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Included features</div>
            <ul className="mt-3 space-y-2">
              {currentPlan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="mt-0.5 text-green-600 dark:text-green-400"><FiCheck size={16} /></span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Limits</div>
            <div className="mt-3 space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex items-center justify-between"><span>Audits / month</span><span className="font-medium">{currentPlan.limits.auditsPerMonth}</span></div>
              <div className="flex items-center justify-between"><span>Storage</span><span className="font-medium">{currentPlan.limits.storageGb} GB</span></div>
              <div className="flex items-center justify-between"><span>Scans / month</span><span className="font-medium">{currentPlan.limits.scansPerMonth}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Billing */}
      <div className="apple-card">
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Billing</div>
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Invoices and payment method.</div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-7 apple-card p-0 overflow-hidden">
            <div className="px-5 py-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Latest invoices</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Download PDF receipts.</div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900/40 text-gray-600 dark:text-gray-300">
                  <tr>
                    <th className="text-left font-medium px-4 py-3">Invoice</th>
                    <th className="text-left font-medium px-4 py-3">Date</th>
                    <th className="text-left font-medium px-4 py-3">Amount</th>
                    <th className="text-left font-medium px-4 py-3">Status</th>
                    <th className="text-left font-medium px-4 py-3">PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                  {state.invoices.map((inv) => (
                    <tr key={inv.id} className="bg-white dark:bg-black">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{inv.id}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{formatDate(inv.dateIso)}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{money(inv.amount)}</td>
                      <td className="px-4 py-3">
                        <Pill
                          text={inv.status}
                          tone={inv.status === 'Paid' ? 'success' : inv.status === 'Free' ? 'neutral' : 'warning'}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => onDownloadInvoice(inv)}
                          className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="apple-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Payment method</div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Stored card used for recurring billing.</div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingPayment((v) => !v)}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {editingPayment ? 'Close' : 'Add / edit'}
                </button>
              </div>

              <div className="mt-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
                <div className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                  {state.billing.cardBrand} •••• {state.billing.last4}
                </div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Expires {state.billing.exp}</div>
              </div>

              {editingPayment && (
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Brand</div>
                    <select
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black px-3 py-2 text-sm"
                      value={state.billing.cardBrand}
                      onChange={(e) => savePayment({ cardBrand: e.target.value })}
                    >
                      <option value="Visa">Visa</option>
                      <option value="Mastercard">Mastercard</option>
                      <option value="Amex">Amex</option>
                    </select>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Last 4</div>
                    <input
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black px-3 py-2 text-sm"
                      value={state.billing.last4}
                      onChange={(e) => savePayment({ last4: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                      placeholder="4242"
                    />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Expiry</div>
                    <input
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black px-3 py-2 text-sm"
                      value={state.billing.exp}
                      onChange={(e) => savePayment({ exp: e.target.value })}
                      placeholder="12/28"
                    />
                  </div>
                  <div className="sm:col-span-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPayment(false);
                        showNotice('Payment method saved (demo).');
                      }}
                      className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="apple-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Automatic billing</div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Charge your saved payment method automatically.</div>
                </div>
                <button
                  type="button"
                  onClick={toggleAutoBilling}
                  className={
                    'h-7 w-12 rounded-full border transition-colors ' +
                    (state.billing.autoBilling
                      ? 'bg-blue-600 border-blue-600'
                      : 'bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-700')
                  }
                  aria-label="Toggle automatic billing"
                >
                  <span
                    className={
                      'block h-6 w-6 rounded-full bg-white dark:bg-black shadow-sm transform transition-transform ' +
                      (state.billing.autoBilling ? 'translate-x-5' : 'translate-x-0.5')
                    }
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade */}
      <div className="apple-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Upgrade</div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Compare plans and upgrade with Stripe Checkout.</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={upgradeWithStripe}
              className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Upgrade with Stripe
            </button>
            <button
              type="button"
              onClick={applyPlanLocally}
              className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Demo-only plan switch"
            >
              Apply (demo)
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-8 apple-card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900/40 text-gray-600 dark:text-gray-300">
                  <tr>
                    <th className="text-left font-medium px-4 py-3">Plan</th>
                    <th className="text-left font-medium px-4 py-3">Price</th>
                    <th className="text-left font-medium px-4 py-3">Audits/mo</th>
                    <th className="text-left font-medium px-4 py-3">Storage</th>
                    <th className="text-left font-medium px-4 py-3">Scans/mo</th>
                    <th className="text-left font-medium px-4 py-3">Trial</th>
                    <th className="text-left font-medium px-4 py-3">Select</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                  {plans.map((p) => (
                    <tr key={p.key} className={p.key === upgradePlan ? 'bg-gray-50 dark:bg-gray-900/30' : 'bg-white dark:bg-black'}>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{p.key}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {p.key === 'Enterprise' ? `${money(enterpriseMonthly)} (est.)` : `${money(p.priceMonthly)}/mo`}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{p.limits.auditsPerMonth}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{p.limits.storageGb} GB</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{p.limits.scansPerMonth}</td>
                      <td className="px-4 py-3">{p.trialDays ? <Pill text={`${p.trialDays} days`} /> : <Pill text="—" />}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => onChangePlan(p.key)}
                          className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-4 apple-card">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Enterprise price calculator</div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Estimate monthly price for Enterprise.</div>

            <div className="mt-4 grid grid-cols-1 gap-3">
              <div>
                <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Seats</div>
                <input
                  type="number"
                  min={1}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black px-3 py-2 text-sm"
                  value={state.enterpriseCalculator.seats}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      enterpriseCalculator: { ...prev.enterpriseCalculator, seats: Number(e.target.value || 1) },
                    }))
                  }
                />
              </div>
              <div>
                <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Rate / seat</div>
                <input
                  type="number"
                  min={0}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black px-3 py-2 text-sm"
                  value={state.enterpriseCalculator.ratePerSeat}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      enterpriseCalculator: { ...prev.enterpriseCalculator, ratePerSeat: Number(e.target.value || 0) },
                    }))
                  }
                />
              </div>
              <div>
                <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Base fee</div>
                <input
                  type="number"
                  min={0}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black px-3 py-2 text-sm"
                  value={state.enterpriseCalculator.baseFee}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      enterpriseCalculator: { ...prev.enterpriseCalculator, baseFee: Number(e.target.value || 0) },
                    }))
                  }
                />
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
                <div className="text-xs text-gray-500 dark:text-gray-400">Estimated total</div>
                <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{money(enterpriseMonthly)}/mo</div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Used for Enterprise upgrades.</div>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                Stripe integration uses the existing `/payments/create-checkout-session` endpoint.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Usage */}
      <div className="apple-card">
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Usage</div>
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Monthly consumption and limits.</div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-5 space-y-4">
            <Progress
              label={`Audits (${state.usage.monthLabel})`}
              used={state.usage.auditsUsed}
              limit={currentPlan.limits.auditsPerMonth}
              unit=""
              hint="Number of audits started this month."
            />
            <Progress
              label={`Storage (${state.usage.monthLabel})`}
              used={Math.round(state.usage.storageUsedGb * 10) / 10}
              limit={currentPlan.limits.storageGb}
              unit=" GB"
              hint="Total report/storage usage."
            />
            <Progress
              label={`Scans (${state.usage.monthLabel})`}
              used={state.usage.scansUsed}
              limit={currentPlan.limits.scansPerMonth}
              unit=""
              hint="Vulnerability scans executed."
            />
          </div>

          <div className="lg:col-span-7 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Usage chart</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Last 15 days</div>
              </div>
              <Pill text="Analytics" />
            </div>
            <div className="mt-3 h-56">
              <Line data={usageChart.data} options={usageChart.options} />
            </div>
          </div>
        </div>

        <div className="mt-4 apple-card p-0 overflow-hidden">
          <div className="px-5 py-4">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Usage history</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Recent activity and deltas.</div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/40 text-gray-600 dark:text-gray-300">
                <tr>
                  <th className="text-left font-medium px-4 py-3">Date</th>
                  <th className="text-left font-medium px-4 py-3">Audits</th>
                  <th className="text-left font-medium px-4 py-3">Scans</th>
                  <th className="text-left font-medium px-4 py-3">Storage Δ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                {state.usage.history.map((h) => (
                  <tr key={h.id} className="bg-white dark:bg-black">
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{formatDate(h.dateIso)}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{h.audits}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{h.scans}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">+{h.storageGbDelta} GB</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
