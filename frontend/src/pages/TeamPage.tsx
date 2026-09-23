import { useEffect, useMemo, useState } from "react";
import { useSaaSStore, type TeamMember, type Filters } from "../store";
import { apiClient } from "../api/apiClient";
import { Users, Search, Mail, Shield, UserPlus, Trash2 } from "lucide-react";

interface TeamMemberCardProps {
  teamMember: TeamMember;
  isSelected: boolean;
  onSelect: (selectedTeamMember: TeamMember) => void;
  onUpdate: (teamMemberToUpdate: TeamMember) => void;
  onDelete: (teamMemberToDelete: TeamMember) => void;
}

function TeamMemberCard({ teamMember, isSelected, onSelect, onUpdate, onDelete }: TeamMemberCardProps) {
  return (
    <div
      onClick={() => onSelect(teamMember)}
      style={{ border: `1px solid ${isSelected ? "var(--accent)" : "var(--border)"}`, background: isSelected ? "var(--accent-bg)" : "var(--code-bg)", borderRadius: 10, padding: 16, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>
          {teamMember.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight: 700, color: "var(--text-h)", display: "flex", alignItems: "center", gap: 6 }}>
            {teamMember.name} <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 999, background: teamMember.status === "active" ? "rgba(34,197,94,0.15)" : "var(--border)" }}>{teamMember.status}</span>
          </div>
          <div style={{ fontSize: 12, color: "var(--text)", display: "flex", alignItems: "center", gap: 6 }}>
            <Mail size={12} /> {teamMember.email} • <Shield size={12} /> {teamMember.role}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUpdate({ ...teamMember, role: teamMember.role === "Admin" ? "Technician" : "Admin" });
          }}
          style={{ padding: "6px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg)", cursor: "pointer", fontSize: 12 }}
        >
          Toggle role
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(teamMember);
          }}
          style={{ padding: "6px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg)", cursor: "pointer", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 4 }}
        >
          <Trash2 size={12} /> Remove
        </button>
      </div>
    </div>
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
  onCreate: (newTeamMember: Omit<TeamMember, "id">) => void;
  onUpdate: (teamMemberToUpdate: TeamMember) => void;
  onDelete: (teamMemberToDelete: TeamMember) => void;
  onSelect: (selectedTeamMember: TeamMember) => void;
}

function TeamContent({ teamMembers, selectedTeamMember, searchQuery, filters: _filters, currentPage, isLoading, isSubmitting, onCreate, onUpdate, onDelete, onSelect }: TeamPageProps) {
  const [teamSearchQuery, setTeamSearchQuery] = useState(searchQuery);

  const filteredTeamMembers = useMemo(() => {
    const normalizedQuery = teamSearchQuery.toLowerCase();
    return teamMembers.filter((teamMember) => !normalizedQuery || teamMember.name.toLowerCase().includes(normalizedQuery) || teamMember.email.toLowerCase().includes(normalizedQuery));
  }, [teamMembers, teamSearchQuery]);

  const paginatedTeamMembers = useMemo(() => {
    const pageSize = 10;
    const start = (currentPage - 1) * pageSize;
    return filteredTeamMembers.slice(start, start + pageSize);
  }, [filteredTeamMembers, currentPage]);

  if (isLoading) return <div style={{ padding: 16 }}>Loading team members…</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={16} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--auth-text-muted)" }} />
          <input
            value={teamSearchQuery}
            onChange={(e) => setTeamSearchQuery(e.target.value)}
            placeholder="Search team members…"
            style={{ width: "100%", padding: "10px 12px 10px 32px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--auth-input-bg)", color: "var(--text-h)" }}
          />
        </div>
        <button
          onClick={() => onCreate({ name: `New Member ${teamMembers.length + 1}`, email: `new${teamMembers.length + 1}_${Date.now()}@saas.co`, role: "Analyst", status: "invited" })}
          disabled={isSubmitting}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 14px", borderRadius: 8, border: "none", background: "var(--accent)", color: "#fff", cursor: "pointer", fontWeight: 700 }}
        >
          <UserPlus size={16} /> {isSubmitting ? "Inviting…" : "Invite member"}
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {paginatedTeamMembers.map((teamMember) => (
          <TeamMemberCard
            key={teamMember.id}
            teamMember={teamMember}
            isSelected={selectedTeamMember?.id === teamMember.id}
            onSelect={onSelect}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
        {paginatedTeamMembers.length === 0 && <div style={{ textAlign: "center", color: "var(--auth-text-muted)", padding: 24 }}>No team members found.</div>}
      </div>
      <div style={{ fontSize: 12, textAlign: "center", color: "var(--auth-text-muted)" }}>Page {currentPage} • {filteredTeamMembers.length} members</div>
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

  const fetchTeam = async () => {
    setLocalLoading(true);
    setIsLoading(true);
    try {
      const data: any = await apiClient("/api/team");
      const list: TeamMember[] = data.members ?? data.teamMembers ?? [];
      setTeamMembers(list);
    } catch (e: any) {
      pushToast({ kind: "error", title: "Failed to load team", msg: e.message });
    } finally {
      setLocalLoading(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleCreateTeamMember: TeamPageProps["onCreate"] = async (newTeamMember) => {
    setIsSubmitting(true);
    try {
      const data: any = await apiClient("/api/team", newTeamMember, "POST");
      const created: TeamMember = data.member;
      setTeamMembers([created, ...teamMembers]);
      pushToast({ kind: "success", title: "Invite sent", msg: created.email });
    } catch (e: any) {
      pushToast({ kind: "error", title: "Invite failed", msg: e.message });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleUpdateTeamMember: TeamPageProps["onUpdate"] = async (teamMemberToUpdate) => {
    try {
      const data: any = await apiClient(`/api/team/${teamMemberToUpdate.id}`, teamMemberToUpdate, "PUT");
      const updated: TeamMember = data.member;
      setTeamMembers(teamMembers.map((teamMember) => (teamMember.id === updated.id ? updated : teamMember)));
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
    <div style={{ padding: 32, textAlign: "left" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Users size={28} style={{ color: "var(--accent)" }} />
        <h1 style={{ margin: 0, fontSize: 32 }}>Team</h1>
      </div>
      <TeamContent
        teamMembers={teamMembers}
        selectedTeamMember={selectedTeamMember}
        searchQuery={searchQuery}
        filters={filters}
        currentPage={currentPage}
        isLoading={isLoading}
        isSubmitting={isSubmitting}
        onCreate={handleCreateTeamMember}
        onUpdate={handleUpdateTeamMember}
        onDelete={handleDeleteTeamMember}
        onSelect={handleSelectTeamMember}
      />
    </div>
  );
}
