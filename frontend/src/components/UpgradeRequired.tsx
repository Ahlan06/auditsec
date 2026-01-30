import React, { useEffect, useState } from 'react';
import { FiLock, FiZap, FiCheck, FiX } from 'react-icons/fi';

interface UpgradeRequiredProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
  currentPlan?: string;
}

const UpgradeRequired: React.FC<UpgradeRequiredProps> = ({
  isOpen,
  onClose,
  feature = 'this feature',
  currentPlan = 'Free',
}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 200); // Wait for animation
  };

  const handleUpgrade = () => {
    window.location.href = '/client/subscription';
  };

  if (!isOpen) return null;

  const plans = [
    {
      name: 'Pro',
      price: '$49',
      period: '/month',
      features: [
        'Unlimited security audits',
        'Advanced AI analysis',
        'Priority support',
        'Export to PDF/JSON',
        'Custom integrations',
      ],
      recommended: true,
    },
    {
      name: 'Enterprise',
      price: '$199',
      period: '/month',
      features: [
        'Everything in Pro',
        'Dedicated account manager',
        'Custom SLA',
        'On-premise deployment',
        'Advanced compliance reports',
        'White-label options',
      ],
      recommended: false,
    },
  ];

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${
        show ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-200 ${
          show ? 'scale-100' : 'scale-95'
        }`}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-4">
            <FiLock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Upgrade Required
          </h2>
          <p className="text-blue-100 max-w-lg mx-auto">
            Access to <span className="font-semibold">{feature}</span> requires a premium plan.
            Upgrade now to unlock powerful security features.
          </p>
        </div>

        {/* Current plan badge */}
        <div className="px-8 -mt-4 mb-6">
          <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2 border border-gray-200 dark:border-gray-600">
            <span className="text-sm text-gray-600 dark:text-gray-400">Current plan:</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{currentPlan}</span>
          </div>
        </div>

        {/* Plans */}
        <div className="px-8 pb-8">
          <div className="grid md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-lg border-2 p-6 transition-all duration-200 ${
                  plan.recommended
                    ? 'border-blue-500 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/10'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50'
                }`}
              >
                {/* Recommended badge */}
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="inline-flex items-center gap-1 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      <FiZap className="w-3 h-3" />
                      RECOMMENDED
                    </div>
                  </div>
                )}

                {/* Plan header */}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      {plan.price}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">{plan.period}</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA button */}
                <button
                  onClick={handleUpgrade}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                    plan.recommended
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  Upgrade to {plan.name}
                </button>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-6">
            All plans include a 14-day money-back guarantee. No questions asked.
          </p>
        </div>
      </div>
    </div>
  );
};

// Global modal manager
let globalSetUpgradeModal: ((isOpen: boolean) => void) | null = null;

export const UpgradeRequiredModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [feature, setFeature] = useState<string>();

  useEffect(() => {
    globalSetUpgradeModal = setIsOpen;

    // Listen for custom event from apiClient
    const handleShowUpgrade = (e: Event) => {
      const customEvent = e as CustomEvent;
      setFeature(customEvent.detail?.feature);
      setIsOpen(true);
    };

    window.addEventListener('show-upgrade-modal', handleShowUpgrade);

    return () => {
      globalSetUpgradeModal = null;
      window.removeEventListener('show-upgrade-modal', handleShowUpgrade);
    };
  }, []);

  return (
    <UpgradeRequired
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      feature={feature}
    />
  );
};

export const showUpgradeModal = (feature?: string) => {
  if (globalSetUpgradeModal) {
    globalSetUpgradeModal(true);
  } else {
    window.dispatchEvent(
      new CustomEvent('show-upgrade-modal', { detail: { feature } })
    );
  }
};

export default UpgradeRequired;
