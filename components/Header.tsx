
import React from 'react';

interface HeaderProps {
  onHome?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onHome }) => {
  return (
    <header className="w-full bg-white border-b border-slate-200 py-4 px-8 flex justify-between items-center sticky top-0 z-50 shadow-sm">
      <div 
        className="flex items-center gap-3 cursor-pointer group" 
        onClick={onHome}
      >
        <div className="bg-indigo-600 p-2 rounded-lg text-white group-hover:bg-indigo-700 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="m19 9-7 7-7-7"/><path d="M19 5v4"/><path d="M5 5v4"/><path d="M19 15v4"/><path d="M5 15v4"/></svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          사다리 게임
        </h1>
      </div>
      
      <button 
        onClick={onHome}
        className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all font-bold text-sm border border-slate-200 hover:border-indigo-100 shadow-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        첫 페이지로
      </button>
    </header>
  );
};

export default Header;
