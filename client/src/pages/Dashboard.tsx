import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, Shield, BarChart3, Users, LogOut, Menu, X } from "lucide-react";
import IncidentSubmission from "./IncidentSubmission";
import IncidentList from "./IncidentList";
import Analytics from "./Analytics";
import AdminPanel from "./AdminPanel";

type View = "dashboard" | "submit" | "incidents" | "analytics" | "admin";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
  };

  if (!user) {
    return null;
  }

  const isAdmin = user.role === "admin";
  const isAnalyst = user.role === "analyst" || user.role === "admin";

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } transition-all duration-300 border-r border-accent/30 bg-card overflow-hidden flex flex-col`}
      >
        <div className="p-6 border-b border-accent/30">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-6 h-6 text-cyan-400" />
            <h1 className="text-xl font-bold font-mono text-accent">CyberShield</h1>
          </div>
          <p className="text-xs text-muted-foreground font-mono">Incident Portal</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavItem
            icon={<BarChart3 className="w-4 h-4" />}
            label="Dashboard"
            active={currentView === "dashboard"}
            onClick={() => setCurrentView("dashboard")}
          />

          <NavItem
            icon={<AlertCircle className="w-4 h-4" />}
            label="Submit Incident"
            active={currentView === "submit"}
            onClick={() => setCurrentView("submit")}
          />

          {isAnalyst && (
            <NavItem
              icon={<Shield className="w-4 h-4" />}
              label="Incidents"
              active={currentView === "incidents"}
              onClick={() => setCurrentView("incidents")}
            />
          )}

          {isAnalyst && (
            <NavItem
              icon={<BarChart3 className="w-4 h-4" />}
              label="Analytics"
              active={currentView === "analytics"}
              onClick={() => setCurrentView("analytics")}
            />
          )}

          {isAdmin && (
            <NavItem
              icon={<Users className="w-4 h-4" />}
              label="Admin Panel"
              active={currentView === "admin"}
              onClick={() => setCurrentView("admin")}
            />
          )}
        </nav>

        <div className="p-4 border-t border-accent/30 space-y-2">
          <div className="text-xs text-muted-foreground font-mono">
            <p>{user.name}</p>
            <p className="text-cyan-400">{user.role.toUpperCase()}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 font-mono"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-accent/30 bg-card p-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-accent/10 rounded-none border border-accent/30"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-4">
            <div className="text-right text-sm">
              <p className="font-mono font-semibold">{getViewTitle(currentView)}</p>
              <p className="text-xs text-muted-foreground">
                {new Date().toLocaleString()}
              </p>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          {currentView === "dashboard" && <DashboardView />}
          {currentView === "submit" && <IncidentSubmission />}
          {currentView === "incidents" && isAnalyst && <IncidentList />}
          {currentView === "analytics" && isAnalyst && <Analytics />}
          {currentView === "admin" && isAdmin && <AdminPanel />}
        </main>
      </div>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-none border transition-all font-mono text-sm ${
        active
          ? "bg-accent/20 border-accent/60 text-accent"
          : "border-accent/20 text-muted-foreground hover:border-accent/40 hover:text-foreground"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function DashboardView() {
  const { data: stats, isLoading } = trpc.incident.getAnalytics.useQuery();

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-card-foreground/10 rounded-none" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return <div className="p-6">No data available</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Incidents" value={stats.total} />
        <StatCard label="Critical" value={stats.bySeverity.critical} color="red" />
        <StatCard label="High" value={stats.bySeverity.high} color="orange" />
        <StatCard label="Avg Risk Score" value={stats.avgRiskScore.toFixed(1)} />
      </div>

      <Card className="card-blueprint p-6">
        <h2 className="text-lg font-bold font-mono mb-4 text-accent">Incident Distribution</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm font-mono">
          <div className="border border-accent/30 p-3 rounded-none">
            <p className="text-muted-foreground">Phishing</p>
            <p className="text-xl font-bold text-cyan-300">{stats.byType.phishing}</p>
          </div>
          <div className="border border-accent/30 p-3 rounded-none">
            <p className="text-muted-foreground">Malware</p>
            <p className="text-xl font-bold text-cyan-300">{stats.byType.malware}</p>
          </div>
          <div className="border border-accent/30 p-3 rounded-none">
            <p className="text-muted-foreground">DDoS</p>
            <p className="text-xl font-bold text-cyan-300">{stats.byType.ddos}</p>
          </div>
          <div className="border border-accent/30 p-3 rounded-none">
            <p className="text-muted-foreground">Brute Force</p>
            <p className="text-xl font-bold text-cyan-300">{stats.byType.brute_force}</p>
          </div>
          <div className="border border-accent/30 p-3 rounded-none">
            <p className="text-muted-foreground">Data Exfil</p>
            <p className="text-xl font-bold text-cyan-300">{stats.byType.data_exfiltration}</p>
          </div>
          <div className="border border-accent/30 p-3 rounded-none">
            <p className="text-muted-foreground">Other</p>
            <p className="text-xl font-bold text-cyan-300">{stats.byType.other}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  color = "cyan",
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  const colorClass = {
    cyan: "text-cyan-300",
    red: "text-red-300",
    orange: "text-orange-300",
  }[color];

  return (
    <Card className="card-blueprint p-4">
      <p className="text-xs text-muted-foreground font-mono mb-2">{label}</p>
      <p className={`text-2xl font-bold font-mono ${colorClass}`}>{value}</p>
    </Card>
  );
}

function getViewTitle(view: View): string {
  const titles: Record<View, string> = {
    dashboard: "DASHBOARD",
    submit: "SUBMIT INCIDENT",
    incidents: "INCIDENT MANAGEMENT",
    analytics: "ANALYTICS",
    admin: "ADMIN PANEL",
  };
  return titles[view];
}
