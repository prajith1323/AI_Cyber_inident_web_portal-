import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";

export default function IncidentList() {
  const [, setLocation] = useLocation();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [severityFilter, setSeverityFilter] = useState<string>("");

  const { data: incidents, isLoading } = trpc.incident.list.useQuery({
    status: statusFilter || undefined,
    severity: severityFilter || undefined,
    limit: 50,
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-card-foreground/10 rounded-none" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex gap-4 flex-wrap">
        <div>
          <label className="block text-xs font-mono text-muted-foreground mb-2">
            Filter by Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-blueprint px-3 py-2 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="mitigated">Mitigated</option>
            <option value="resolved">Resolved</option>
            <option value="false_positive">False Positive</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-mono text-muted-foreground mb-2">
            Filter by Severity
          </label>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="input-blueprint px-3 py-2 text-sm"
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {incidents && incidents.length > 0 ? (
          incidents.map((incident: any) => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              onView={() => setLocation(`/incident/${incident.id}`)}
            />
          ))
        ) : (
          <Card className="card-blueprint p-6 text-center">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground font-mono">No incidents found</p>
          </Card>
        )}
      </div>
    </div>
  );
}

function IncidentCard({
  incident,
  onView,
}: {
  incident: any;
  onView: () => void;
}) {
  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case "critical":
        return "severity-critical";
      case "high":
        return "severity-high";
      case "medium":
        return "severity-medium";
      case "low":
        return "severity-low";
      default:
        return "severity-medium";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "text-yellow-300";
      case "investigating":
        return "text-blue-300";
      case "mitigated":
        return "text-green-300";
      case "resolved":
        return "text-green-400";
      case "false_positive":
        return "text-gray-400";
      default:
        return "text-gray-300";
    }
  };

  return (
    <Card className="card-blueprint p-4 cursor-pointer hover:border-accent/60 transition-all">
      <div className="flex items-start justify-between gap-4" onClick={onView}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className={`incident-type-badge`}>
              {incident.incidentType.toUpperCase()}
            </span>
            <span className={getSeverityClass(incident.severity)}>
              {incident.severity.toUpperCase()}
            </span>
          </div>

          <h3 className="font-mono font-semibold text-foreground mb-1 truncate">
            {incident.title}
          </h3>

          <p className="text-xs text-muted-foreground font-mono mb-2 line-clamp-2">
            {incident.description}
          </p>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className={getStatusColor(incident.status)}>
              {incident.status.toUpperCase()}
            </span>
            <span className="text-muted-foreground">
              Risk: {parseFloat(incident.riskScore.toString()).toFixed(1)}/100
            </span>
            <span className="text-muted-foreground">
              {new Date(incident.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="font-mono flex-shrink-0"
          onClick={onView}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
