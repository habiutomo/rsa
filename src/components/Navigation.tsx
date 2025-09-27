import React from 'react';
import { Key, Lock, FileText } from 'lucide-react';

interface NavigationProps {
  activeTab: 'rsa' | 'aes' | 'file';
  setActiveTab: (tab: 'rsa' | 'aes' | 'file') => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'rsa', name: 'RSA Encryption', icon: Key, description: 'Public-key cryptography' },
    { id: 'aes', name: 'AES Encryption', icon: Lock, description: 'Symmetric encryption' },
    { id: 'file', name: 'File Encryption', icon: FileText, description: 'Secure file processing' },
  ];

  return (
    <nav className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'rsa' | 'aes' | 'file')}
                className={`group relative px-6 py-4 flex items-center space-x-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-white bg-slate-700/50 border-b-2 border-teal-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
                }`}
              >
                <Icon className={`h-5 w-5 transition-colors ${
                  isActive ? 'text-teal-400' : 'text-slate-500 group-hover:text-slate-300'
                }`} />
                <div className="text-left">
                  <div className="font-medium">{tab.name}</div>
                  <div className={`text-xs transition-colors ${
                    isActive ? 'text-slate-300' : 'text-slate-500 group-hover:text-slate-400'
                  }`}>
                    {tab.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;