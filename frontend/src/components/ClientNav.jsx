import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/client/dashboard', label: 'Dashboard' },
  { to: '/client/osint-box', label: 'OSINT BOX' },
  { to: '/client/audit-scan', label: 'Audit SCAN' },
  { to: '/client/assets', label: 'Assets' },
  { to: '/client/support', label: 'Support' },
];

const ClientNav = () => {
  return (
    <div className="apple-card p-3 md:p-4 mb-6">
      <div className="flex flex-wrap items-center gap-2 md:gap-3">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) =>
              `px-3 md:px-4 py-2 rounded-lg text-sm md:text-base transition-colors ` +
              (isActive
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700')
            }
          >
            {t.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default ClientNav;
