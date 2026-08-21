import { Link } from "@tanstack/react-router";
import { LayoutDashboard, MessageSquare, Settings, ExternalLink, LogOut } from "lucide-react";

interface AdminSidebarProps {
  activeTab: 'produtos' | 'leads';
  setActiveTab: (tab: 'produtos' | 'leads') => void;
  handleLogout: () => void;
}

export const AdminSidebar = ({ activeTab, setActiveTab, handleLogout }: AdminSidebarProps) => {
  return (
    <aside className="hidden lg:flex w-72 bg-stone-950 text-white flex-col p-8 fixed h-full border-r border-stone-800">
      <div className="mb-12">
        <h1 className="text-2xl font-serif italic text-white leading-none">La Linda</h1>
        <span className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-primary mt-2 block">Dashboard</span>
      </div>
      
      <nav className="flex-1 space-y-2">
        <button 
          onClick={() => setActiveTab('produtos')}
          className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-sans uppercase tracking-[0.2em] font-black transition-all ${
            activeTab === 'produtos' 
              ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' 
              : 'text-stone-500 hover:text-white hover:bg-white/5'
          }`}
        >
          <LayoutDashboard size={18} />
          Produtos
        </button>
        <button 
          onClick={() => setActiveTab('leads')}
          className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-sans uppercase tracking-[0.2em] font-black transition-all ${
            activeTab === 'leads' 
              ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' 
              : 'text-stone-500 hover:text-white hover:bg-white/5'
          }`}
        >
          <MessageSquare size={18} />
          Leads
        </button>
        <button className="w-full flex items-center gap-4 px-4 py-3 text-stone-500 hover:text-white hover:bg-white/5 rounded-xl font-bold transition-all">
          <Settings size={18} />
          <span className="text-sm uppercase tracking-widest">Config</span>
        </button>
      </nav>

      <div className="mt-auto pt-8 border-t border-stone-800 space-y-4">
        <Link to="/" className="flex items-center gap-4 px-4 py-2 text-stone-500 hover:text-white transition-colors text-xs uppercase tracking-widest font-black">
          <ExternalLink size={14} /> Site Público
        </Link>
        <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3 text-rose-500 hover:bg-rose-500/10 rounded-xl font-bold transition-all">
          <LogOut size={18} />
          <span className="text-sm uppercase tracking-widest">Sair</span>
        </button>
      </div>
    </aside>
  );
};
