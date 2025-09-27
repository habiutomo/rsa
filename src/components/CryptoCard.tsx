import React from 'react';
import { Video as LucideIcon } from 'lucide-react';

interface CryptoCardProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}

const CryptoCard: React.FC<CryptoCardProps> = ({ title, icon: Icon, children }) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition-all duration-200">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-teal-500/20 to-blue-500/20 rounded-lg">
          <Icon className="h-5 w-5 text-teal-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
};

export default CryptoCard;