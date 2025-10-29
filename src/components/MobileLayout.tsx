import { Link, useLocation } from "react-router-dom";
import { Home, Trophy, User, Gamepad2, Mail } from "lucide-react";
import { ReactNode } from "react";

interface MobileLayoutProps {
  children: ReactNode;
}

const MobileLayout = ({ children }: MobileLayoutProps) => {
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", icon: Home, label: "Hjem" },
    { path: "/games", icon: Gamepad2, label: "Mine Konsept" },
    { path: "/invitations", icon: Mail, label: "Invitasjoner" },
    { path: "/leaderboard", icon: Trophy, label: "Tabell" },
    { path: "/profile", icon: User, label: "Profil" },
  ];

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0">
      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t md:hidden z-50">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-6 w-6 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop sidebar navigation */}
      <aside className="hidden md:block fixed left-0 top-0 h-full w-64 border-r bg-card p-4">
        <Link to="/" className="flex items-center gap-2 mb-8 p-2">
          <Trophy className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">Konsept</span>
        </Link>
        
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </div>
  );
};

export default MobileLayout;
