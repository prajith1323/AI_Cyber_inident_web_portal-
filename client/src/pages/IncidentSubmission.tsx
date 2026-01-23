import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const IncidentSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  incidentType: z.enum(["phishing", "malware", "ddos", "brute_force", "data_exfiltration", "other"]),
  affectedSystems: z.string().optional(),
});

type IncidentFormData = z.infer<typeof IncidentSchema>;

export default function IncidentSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<IncidentFormData>({
    resolver: zodResolver(IncidentSchema),
  });

  const submitMutation = trpc.incident.submit.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      reset();
      setIsSubmitting(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit incident");
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: IncidentFormData) => {
    setIsSubmitting(true);
    const affectedSystems = data.affectedSystems
      ? data.affectedSystems.split(",").map((s) => s.trim())
      : undefined;

    submitMutation.mutate({
      title: data.title,
      description: data.description,
      incidentType: data.incidentType,
      affectedSystems,
      timestamp: new Date(),
    });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card className="card-blueprint">
        <h1 className="text-2xl font-bold font-mono mb-2 text-accent">INCIDENT SUBMISSION</h1>
        <p className="text-sm text-muted-foreground mb-6 font-mono">
          Report a cyber security incident for immediate analysis
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-mono font-semibold mb-2">
              Incident Title <span className="text-red-400">*</span>
            </label>
            <input
              {...register("title")}
              type="text"
              placeholder="Brief description of the incident"
              className="input-blueprint w-full px-4 py-2"
            />
            {errors.title && <p className="text-red-400 text-xs mt-1 font-mono">{errors.title.message}</p>}
          </div>

          {/* Incident Type */}
          <div>
            <label className="block text-sm font-mono font-semibold mb-2">
              Incident Type <span className="text-red-400">*</span>
            </label>
            <select
              {...register("incidentType")}
              className="input-blueprint w-full px-4 py-2"
            >
              <option value="">Select incident type...</option>
              <option value="phishing">Phishing</option>
              <option value="malware">Malware</option>
              <option value="ddos">DDoS Attack</option>
              <option value="brute_force">Brute Force Attack</option>
              <option value="data_exfiltration">Data Exfiltration</option>
              <option value="other">Other</option>
            </select>
            {errors.incidentType && (
              <p className="text-red-400 text-xs mt-1 font-mono">{errors.incidentType.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-mono font-semibold mb-2">
              Detailed Description <span className="text-red-400">*</span>
            </label>
            <textarea
              {...register("description")}
              placeholder="Provide detailed information about the incident, timeline, and observations"
              className="input-blueprint w-full px-4 py-2 h-32 resize-none"
            />
            {errors.description && (
              <p className="text-red-400 text-xs mt-1 font-mono">{errors.description.message}</p>
            )}
          </div>

          {/* Affected Systems */}
          <div>
            <label className="block text-sm font-mono font-semibold mb-2">
              Affected Systems (comma-separated)
            </label>
            <input
              {...register("affectedSystems")}
              type="text"
              placeholder="e.g., web_server, database, workstation_01"
              className="input-blueprint w-full px-4 py-2"
            />
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              List systems affected by this incident
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="btn-blueprint flex-1 gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  SUBMITTING...
                </>
              ) : (
                "SUBMIT INCIDENT"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="font-mono"
              onClick={() => reset()}
            >
              CLEAR
            </Button>
          </div>

          <div className="mt-6 p-4 border border-accent/30 rounded-none bg-accent/5">
            <p className="text-xs text-muted-foreground font-mono mb-2">
              ℹ️ AUTOMATED ANALYSIS
            </p>
            <ul className="text-xs text-muted-foreground font-mono space-y-1">
              <li>• AI will automatically classify the incident type</li>
              <li>• Machine learning model will predict severity level</li>
              <li>• Risk score will be calculated (0-100)</li>
              <li>• Defensive recommendations will be generated</li>
              <li>• LLM will provide detailed analysis</li>
            </ul>
          </div>
        </form>
      </Card>
    </div>
  );
}
