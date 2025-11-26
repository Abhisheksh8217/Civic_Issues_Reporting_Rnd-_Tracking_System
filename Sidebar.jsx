import { motion } from 'framer-motion';

function Sidebar({ user, activeTab, setActiveTab, onLogout }) {
  const menuItems = [
    { id: 'report', label: 'Report Issue', icon: '📝', roles: ['user'] },
    { id: 'issues', label: 'All Issues', icon: '📋', roles: ['user', 'authority', 'admin'] },
    { id: 'map', label: 'Issue Map', icon: '🗺️', roles: ['user', 'authority', 'admin'] },
    { id: 'leaderboard', label: 'Leaderboard', icon: '🏆', roles: ['user', 'authority', 'admin'] },
    { id: 'analytics', label: 'Analytics', icon: '📊', roles: ['admin'] },
  ];

  const visibleItems = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <motion.div
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="w-64 bg-white shadow-lg h-screen flex flex-col"
    >
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold text-primary">Civic Portal</h2>
        <p className="text-sm text-gray-600 mt-1 capitalize">{user.role}</p>
      </div>

      <nav className="flex-1 p-4">
        {visibleItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition flex items-center gap-3 ${
              activeTab === item.id
                ? 'bg-primary text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t">
        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Logged in as</p>
          <p className="font-semibold text-gray-800">{user.name}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
        <button
          onClick={onLogout}
          className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </motion.div>
  );
}

export default Sidebar;
