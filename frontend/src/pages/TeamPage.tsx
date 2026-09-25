import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useSaaSStore, type TeamMember, type Filters } from "../store";
import { apiClient } from "../api/apiClient";
import { Users, Mail, Shield, UserPlus, Trash2, Pencil, ArrowRight } from "lucide-react";
import { PageHeader, Card, Reveal, SearchField, EmptyState, LoadingState, ErrorState } from "../components/ui/primitives";
import Modal from "../components/ui/Modal";

const STATUS_BADGE: Record<TeamMember["status"], string> = {
  active: "badge-success",
  invited: "badge-warning",
  offline: "badge-neutral",
};

const MEMBER_STATUSES: Array<TeamMember["status"]> = ["active", "invited", "offline"];

export interface TeamMemberFormValues {
  name: string;
  email: string;
  role: string;
  status: TeamMember["status"];
}

function TeamMemberForm({
  initial,
  knownRoles,
  submitLabel,
  isSubmitting,
  lockEmail = false,
  onSubmit,
}: {
  initial: TeamMemberFormValues;
  knownRoles: string[];
  submitLabel: string;
  isSubmitting: boolean;
  lockEmail?: boolean;
  onSubmit: (values: TeamMemberFormValues) => void;
}) {
  const [form, setForm] = useState<TeamMemberFormValues>(initial);
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Member name is required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    if (!form.role.trim()) {
      setError("Role is required.");
      return;
    }
    setError("");
    onSubmit({ name: form.name.trim(), email: form.email.trim(), role: form.role.trim(), status: form.status });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="member-name" className="field-label">Full name</label>
        <input
          id="member-name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="e.g. Alex Morgan"
          maxLength={100}
          required
          className="input"
        />
      </div>
      <div>
        <label htmlFor="member-email" className="field-label">Email address</label>
        <input
          id="member-email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          placeholder="alex@company.com"
          required
          disabled={lockEmail}
          className="input disabled:opacity-60"
        />
        {lockEmail && <p className="mt-1 text-xs text-[var(--text-muted)]">Email identifies the member and can&apos;t be changed here.</p>}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="member-role" className="field-label">Role</label>
          <input
            id="member-role"
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            placeholder="e.g. Analyst"
            maxLength={50}
            required
            list="member-role-options"
            className="input"
          />
          <datalist id="member-role-options">
            {knownRoles.map((r) => (
              <option key={r} value={r} />
            ))}
          </datalist>
        </div>
        <div>
          <label htmlFor="member-status" className="field-label">Status</label>
          <select
            id="member-status"
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as TeamMember["status"] }))}
            className="select"
          >
            {MEMBER_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
      {error && <p className="text-[13px] font-medium text-[var(--danger)]" role="alert">{error}</p>}
      <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full !py-2.5">
        {isSubmitting ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}

interface TeamMemberCardProps {
  teamMember: TeamMember;
  isSelected: boolean;
  onSelect: (selectedTeamMember: TeamMember) => void;
  onEdit: (memberToEdit: TeamMember) => void;
  onDelete: (teamMemberToDelete: TeamMember) => void;
}

function TeamMemberCard({ teamMember, isSelected, onSelect, onEdit, onDelete }: TeamMemberCardProps) {
  return (
    <Reveal>
      <div
        onClick={() => onSelect(teamMember)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(teamMember);
          }
        }}
        className={`card card-hover cursor-pointer p-4 ${isSelected ? "!border-[var(--accent)] ring-2 ring-[var(--ring)]" : ""}`}
        aria-pressed={isSelected}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-bold text-white">
              {teamMember.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="truncate text-sm font-bold text-[var(--text-h)]">{teamMember.name}</span>
                <span className={`badge ${STATUS_BADGE[teamMember.status]}`}>{teamMember.status}</span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[var(--text-muted)]">
                <span className="inline-flex items-center gap-1">
                  <Mail size={12} aria-hidden /> {teamMember.email}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Shield size={12} aria-hidden /> {teamMember.role}
                </span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onEdit(teamMember)}
              aria-label={`Edit ${teamMember.name}`}
              title="Edit member"
              className="icon-btn !h-9 !w-9"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={() => onDelete(teamMember)}
              aria-label={`Remove ${teamMember.name}`}
              title="Remove"
              className="icon-btn !h-9 !w-9 hover:!border-[var(--danger-bg)] hover:!bg-[var(--danger-bg)] hover:!text-[var(--danger)]"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

interface TeamPageProps {
  teamMembers: TeamMember[];
  selectedTeamMember: TeamMember | null;
  searchQuery: string;
  filters: Filters;
  currentPage: number;
  isLoading: boolean;
  isSubmitting: boolean;
  fetchError: string | null;
  onCreate: (values: TeamMemberFormValues) => void;
  onUpdate: (memberId: string, values: TeamMemberFormValues) => void;
  onDelete: (teamMemberToDelete: TeamMember) => void;
  onSelect: (selectedTeamMember: TeamMember) => void;
  onRetry: () => void;
}

function TeamContent({ teamMembers, selectedTeamMember, searchQuery, currentPage, isLoading, isSubmitting, fetchError, onCreate, onUpdate, onDelete, onSelect, onRetry }: TeamPageProps) {
  const [teamSearchQuery, setTeamSearchQuery] = useState(searchQuery);
  const [showInvite, setShowInvite] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);

  const knownRoles = useMemo(
    () => Array.from(new Set(teamMembers.map((m) => m.role).filter(Boolean))).sort(),
    [teamMembers]
  );

  const filteredTeamMembers = useMemo(() => {
    const normalizedQuery = teamSearchQuery.toLowerCase();
    return teamMembers.filter((teamMember) => !normalizedQuery || teamMember.name.toLowerCase().includes(normalizedQuery) || teamMember.email.toLowerCase().includes(normalizedQuery));
  }, [teamMembers, teamSearchQuery]);

  const paginatedTeamMembers = useMemo(() => {
    const pageSize = 10;
    const start = (currentPage - 1) * pageSize;
    return filteredTeamMembers.slice(start, start + pageSize);
  }, [filteredTeamMembers, currentPage]);

  if (isLoading) return <LoadingState message="Loading team members…" rows={4} />;

  if (fetchError) return <ErrorState message={fetchError} onRetry={onRetry} />;

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <SearchField value={teamSearchQuery} onChange={setTeamSearchQuery} placeholder="Search team members…" label="Search team members" />
        <button onClick={() => setShowInvite(true)} disabled={isSubmitting} className="btn btn-primary shrink-0">
          <UserPlus size={16} aria-hidden /> {isSubmitting ? "Inviting…" : "Invite member"}
        </button>
      </Card>

      <div className="flex flex-col gap-2.5">
        {paginatedTeamMembers.map((teamMember) => (
          <TeamMemberCard
            key={teamMember.id}
            teamMember={teamMember}
            isSelected={selectedTeamMember?.id === teamMember.id}
            onSelect={onSelect}
            onEdit={setEditing}
            onDelete={onDelete}
          />
        ))}
        {paginatedTeamMembers.length === 0 && (
          <Card>
            <EmptyState
              icon={<Users className="h-5 w-5" aria-hidden />}
              title="No team members found"
              message="Try a different search, or invite someone to your workspace."
            />
          </Card>
        )}
      </div>
      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-[var(--text-muted)]">
        Page {currentPage} <ArrowRight size={12} aria-hidden /> {filteredTeamMembers.length} members
      </p>

      {showInvite && (
        <Modal title="Invite team member" subtitle="An invite record is created in the database." onClose={() => setShowInvite(false)}>
          <TeamMemberForm
            initial={{ name: "", email: "", role: knownRoles[0] ?? "Analyst", status: "invited" }}
            knownRoles={knownRoles}
            submitLabel="Send invite"
            isSubmitting={isSubmitting}
            onSubmit={(values) => {
              onCreate(values);
              setShowInvite(false);
            }}
          />
        </Modal>
      )}
      {editing && (
        <Modal title="Edit team member" subtitle={editing.email} onClose={() => setEditing(null)}>
          <TeamMemberForm
            initial={{ name: editing.name, email: editing.email, role: editing.role, status: editing.status }}
            knownRoles={knownRoles}
            submitLabel="Save changes"
            isSubmitting={isSubmitting}
            lockEmail
            onSubmit={(values) => {
              onUpdate(editing.id, values);
              setEditing(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}

export default function TeamPage() {
  const teamMembers = useSaaSStore((s) => s.teamMembers);
  const selectedTeamMember = useSaaSStore((s) => s.selectedTeamMember);
  const searchQuery = useSaaSStore((s) => s.searchQuery);
  const filters = useSaaSStore((s) => s.filters);
  const currentPage = useSaaSStore((s) => s.currentPage);
  const isSubmitting = useSaaSStore((s) => s.isSubmitting);
  const setTeamMembers = useSaaSStore((s) => s.setTeamMembers);
  const setSelectedTeamMember = useSaaSStore((s) => s.setSelectedTeamMember);
  const setIsSubmitting = useSaaSStore((s) => s.setIsSubmitting);
  const setIsLoading = useSaaSStore((s) => s.setIsLoading);
  const pushToast = useSaaSStore((s) => s.pushToast);

  const [isLoading, setLocalLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchTeam = async () => {
    setLocalLoading(true);
    setIsLoading(true);
    setFetchError(null);
    try {
      const data: any = await apiClient("/api/team");
      const list: TeamMember[] = data.members ?? data.teamMembers ?? [];
      setTeamMembers(list);
    } catch (e: any) {
      const message = e?.message || "Unable to load team members from the database.";
      setFetchError(message);
      pushToast({ kind: "error", title: "Failed to load team", msg: message });
    } finally {
      setLocalLoading(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleCreateTeamMember: TeamPageProps["onCreate"] = async (values) => {
    setIsSubmitting(true);
    try {
      const data: any = await apiClient("/api/team", values, "POST");
      const created: TeamMember = data.member;
      setTeamMembers([created, ...teamMembers]);
      pushToast({ kind: "success", title: "Invite sent", msg: created.email });
    } catch (e: any) {
      pushToast({ kind: "error", title: "Invite failed", msg: e.message });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleUpdateTeamMember: TeamPageProps["onUpdate"] = async (memberId, values) => {
    try {
      const data: any = await apiClient(`/api/team/${memberId}`, values, "PUT");
      const updated: TeamMember = data.member;
      setTeamMembers(teamMembers.map((teamMember) => (teamMember.id === updated.id ? updated : teamMember)));
      if (selectedTeamMember?.id === updated.id) setSelectedTeamMember(updated);
      pushToast({ kind: "info", title: "Member updated", msg: updated.name });
    } catch (e: any) {
      pushToast({ kind: "error", title: "Update failed", msg: e.message });
    }
  };
  const handleDeleteTeamMember: TeamPageProps["onDelete"] = async (teamMemberToDelete) => {
    try {
      await apiClient(`/api/team/${teamMemberToDelete.id}`, undefined, "DELETE");
      setTeamMembers(teamMembers.filter((teamMember) => teamMember.id !== teamMemberToDelete.id));
      if (selectedTeamMember?.id === teamMemberToDelete.id) setSelectedTeamMember(null);
      pushToast({ kind: "warn", title: "Member removed", msg: teamMemberToDelete.name });
    } catch (e: any) {
      pushToast({ kind: "error", title: "Delete failed", msg: e.message });
    }
  };
  const handleSelectTeamMember: TeamPageProps["onSelect"] = (teamMemberToSelect) => {
    setSelectedTeamMember(teamMemberToSelect);
  };

  return (
    <div className="page-wrap">
      <div className="mx-auto max-w-[1280px]">
        <PageHeader
          eyebrow="People"
          title="Team"
          description="Roles, access and availability across your workspace."
          actions={<span className="badge badge-accent">{teamMembers.length} members</span>}
        />
        <div className="mt-5">
          <TeamContent
            teamMembers={teamMembers}
            selectedTeamMember={selectedTeamMember}
            searchQuery={searchQuery}
            filters={filters}
            currentPage={currentPage}
            isLoading={isLoading}
            isSubmitting={isSubmitting}
            fetchError={fetchError}
            onCreate={handleCreateTeamMember}
            onUpdate={handleUpdateTeamMember}
            onDelete={handleDeleteTeamMember}
            onSelect={handleSelectTeamMember}
            onRetry={fetchTeam}
          />
        </div>
      </div>
    </div>
  );
}
