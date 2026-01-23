import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function Analytics() {
  const { data: stats, isLoading } = trpc.incident.getAnalytics.useQuery();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="space-y-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 bg-card-foreground/10 rounded-none" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return <div className="p-6 text-muted-foreground">No analytics data available</div>;
  }

  const severityData = [
    { name: "Critical", value: stats.bySeverity.critical, color: "#ff4444" },
    { name: "High", value: stats.bySeverity.high, color: "#ff9900" },
    { name: "Medium", value: stats.bySeverity.medium, color: "#ffcc00" },
    { name: "Low", value: stats.bySeverity.low, color: "#00cc00" },
  ];

  const typeData = [
    { name: "Phishing", value: stats.byType.phishing },
    { name: "Malware", value: stats.byType.malware },
    { name: "DDoS", value: stats.byType.ddos },
    { name: "Brute Force", value: stats.byType.brute_force },
    { name: "Data Exfil", value: stats.byType.data_exfiltration },
    { name: "Other", value: stats.byType.other },
  ];

  const statusData = [
    { name: "Open", value: stats.byStatus.open, color: "#ffcc00" },
    { name: "Investigating", value: stats.byStatus.investigating, color: "#0099ff" },
    { name: "Mitigated", value: stats.byStatus.mitigated, color: "#00cc00" },
    { name: "Resolved", value: stats.byStatus.resolved, color: "#00ff00" },
    { name: "False Positive", value: stats.byStatus.false_positive, color: "#999999" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox label="Total Incidents" value={stats.total} />
        <StatBox label="Critical" value={stats.bySeverity.critical} color="red" />
        <StatBox label="High" value={stats.bySeverity.high} color="orange" />
        <StatBox label="Avg Risk Score" value={stats.avgRiskScore.toFixed(1)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Distribution */}
        <Card className="card-blueprint p-6">
          <h3 className="text-lg font-bold font-mono mb-4 text-accent">SEVERITY DISTRIBUTION</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={severityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#0099ff"
                dataKey="value"
              >
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Incident Type Distribution */}
        <Card className="card-blueprint p-6">
          <h3 className="text-lg font-bold font-mono mb-4 text-accent">INCIDENT TYPES</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={typeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 150, 255, 0.2)" />
              <XAxis dataKey="name" stroke="rgba(200, 220, 255, 0.5)" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="rgba(200, 220, 255, 0.5)" />
              <Tooltip contentStyle={{ backgroundColor: "rgba(20, 30, 50, 0.9)", border: "1px solid rgba(0, 150, 255, 0.3)" }} />
              <Bar dataKey="value" fill="#0099ff" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Status Distribution */}
        <Card className="card-blueprint p-6">
          <h3 className="text-lg font-bold font-mono mb-4 text-accent">STATUS DISTRIBUTION</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#0099ff"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Key Metrics */}
        <Card className="card-blueprint p-6">
          <h3 className="text-lg font-bold font-mono mb-4 text-accent">KEY METRICS</h3>
          <div className="space-y-3 font-mono text-sm">
            <div className="flex justify-between border-b border-accent/30 pb-2">
              <span className="text-muted-foreground">Total Incidents:</span>
              <span className="text-cyan-300 font-semibold">{stats.total}</span>
            </div>
            <div className="flex justify-between border-b border-accent/30 pb-2">
              <span className="text-muted-foreground">Critical Incidents:</span>
              <span className="text-red-300 font-semibold">{stats.bySeverity.critical}</span>
            </div>
            <div className="flex justify-between border-b border-accent/30 pb-2">
              <span className="text-muted-foreground">Open Incidents:</span>
              <span className="text-yellow-300 font-semibold">{stats.byStatus.open}</span>
            </div>
            <div className="flex justify-between border-b border-accent/30 pb-2">
              <span className="text-muted-foreground">Resolved Incidents:</span>
              <span className="text-green-300 font-semibold">{stats.byStatus.resolved}</span>
            </div>
            <div className="flex justify-between border-b border-accent/30 pb-2">
              <span className="text-muted-foreground">Avg Risk Score:</span>
              <span className="text-cyan-300 font-semibold">{stats.avgRiskScore.toFixed(1)}/100</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Resolution Rate:</span>
              <span className="text-green-300 font-semibold">
                {stats.total > 0 ? ((stats.byStatus.resolved / stats.total) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatBox({
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
