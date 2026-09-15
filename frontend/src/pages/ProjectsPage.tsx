import { useMemo, useState } from "react";
import { useSaaSStore, type Project, type Filters } from "../store";
import { FolderKanban, Plus, Search, Trash2, Pencil, Eye } from "lucide-react";

interface ProjectCardProps {
  project: Project;
  isSelected: boolean;
  onSelect: (selectedProject: Project) => void;
  onUpdate: (projectToUpdate: Project) => void;
  onDelete: (projectToDelete: Project) => void;
}

function ProjectCard({ project, isSelected, onSelect, onUpdate, onDelete }: ProjectCardProps) {
  return (
    <div
      onClick={() => onSelect(project)}
      style={{
        border: `1px solid ${isSelected ? "var(--accent)" : "var(--border)"}`,
        background: isSelected ? "var(--accent-bg)" : "var(--code-bg)",
        borderRadius: 10,
        padding: 16,
        cursor: "pointer",
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <div>
        <div style={{ fontWeight: 700, color: "var(--text-h)", display: "flex", alignItems: "center", gap: 8 }}>
          <FolderKanban size={16} /> {project.name}
        </div>
        <div style={{ fontSize: 13, color: "var(--text)", marginTop: 4 }}>{project.description}</div>
        <div style={{ fontSize: 12, color: "var(--auth-text-muted)", marginTop: 6 }}>
          Status: {project.status} • Updated: {new Date(project.updatedAt).toLocaleDateString()}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUpdate(project);
          }}
          style={{ border: "1px solid var(--border)", background: "var(--bg)", borderRadius: 6, padding: "4px 8px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12 }}
        >
          <Pencil size={12} /> Edit
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(project);
          }}
          style={{ border: "1px solid var(--border)", background: "var(--bg)", borderRadius: 6, padding: "4px 8px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12 }}
        >
          <Trash2 size={12} /> Delete
        </button>
      </div>
    </div>
  );
}

interface ProjectsPageProps {
  projects: Project[];
  selectedProject: Project | null;
  searchQuery: string;
  filters: Filters;
  currentPage: number;
  isLoading: boolean;
  isSubmitting: boolean;
  onCreate: (newProject: Omit<Project, "id" | "createdAt" | "updatedAt">) => void;
  onUpdate: (projectToUpdate: Project) => void;
  onDelete: (projectToDelete: Project) => void;
  onSelect: (selectedProject: Project) => void;
}

function ProjectsContent({
  projects,
  selectedProject,
  searchQuery,
  filters,
  currentPage,
  isLoading,
  isSubmitting,
  onCreate,
  onUpdate,
  onDelete,
  onSelect,
}: ProjectsPageProps) {
  const [projectSearchInput, setProjectSearchInput] = useState(searchQuery);

  const filteredProjects = useMemo(() => {
    const normalizedQuery = projectSearchInput.toLowerCase();
    return projects.filter((project) => {
      const matchesSearch =
        !normalizedQuery || project.name.toLowerCase().includes(normalizedQuery) || project.description.toLowerCase().includes(normalizedQuery);
      const matchesStatus = filters.status === "all" || project.status === filters.status;
      return matchesSearch && matchesStatus;
    });
  }, [projects, projectSearchInput, filters]);

  const paginatedProjects = useMemo(() => {
    const pageSize = 6;
    const startIndex = (currentPage - 1) * pageSize;
    return filteredProjects.slice(startIndex, startIndex + pageSize);
  }, [filteredProjects, currentPage]);

  if (isLoading) {
    return <div style={{ padding: 16, color: "var(--text)" }}>Loading projects…</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <Search size={16} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--auth-text-muted)" }} />
          <input
            value={projectSearchInput}
            onChange={(queryChangeEvent) => setProjectSearchInput(queryChangeEvent.target.value)}
            placeholder="Search projects…"
            style={{ width: "100%", padding: "10px 12px 10px 32px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--auth-input-bg)", color: "var(--text-h)" }}
          />
        </div>
        <select
          value={filters.status}
          onChange={(filterChangeEvent) =>
            onUpdate({ ...(selectedProject as Project), status: filterChangeEvent.target.value as Project["status"] } as never)
          }
          style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)" }}
        >
          <option value="all">All statuses</option>
          <option value="planning">Planning</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </select>
        <button
          onClick={() =>
            onCreate({
              name: `New Project ${projects.length + 1}`,
              description: "SaaS project description",
              status: "planning",
              ownerId: "current-user",
            })
          }
          disabled={isSubmitting}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 14px", borderRadius: 8, border: "none", background: "var(--accent)", color: "#fff", cursor: "pointer", fontWeight: 700 }}
        >
          <Plus size={16} /> {isSubmitting ? "Creating…" : "Create project"}
        </button>
      </div>

      {selectedProject && (
        <div style={{ padding: 12, borderRadius: 8, background: "var(--accent-bg)", border: "1px solid var(--accent-border)", display: "flex", alignItems: "center", gap: 8 }}>
          <Eye size={16} /> Selected: <strong>{selectedProject.name}</strong> — {selectedProject.description}
        </div>
      )}

      <div style={{ display: "grid", gap: 12 }}>
        {paginatedProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            isSelected={selectedProject?.id === project.id}
            onSelect={onSelect}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
        {paginatedProjects.length === 0 && <div style={{ color: "var(--auth-text-muted)", textAlign: "center", padding: 24 }}>No projects match your filters.</div>}
      </div>

      <div style={{ fontSize: 12, color: "var(--auth-text-muted)", textAlign: "center" }}>
        Page {currentPage} • {filteredProjects.length} projects total
      </div>
    </div>
  );
}

const mockProjects: Project[] = [
  { id: "p1", name: "Atlas CRM", description: "Customer pipeline and revenue analytics", status: "active", ownerId: "u1", createdAt: "2026-01-10", updatedAt: "2026-09-01" },
  { id: "p2", name: "Beacon Launch", description: "Marketing site and onboarding flow", status: "planning", ownerId: "u1", createdAt: "2026-02-14", updatedAt: "2026-08-20" },
  { id: "p3", name: "Northwind Ops", description: "Operations dashboard for logistics", status: "completed", ownerId: "u2", createdAt: "2025-11-02", updatedAt: "2026-07-12" },
  { id: "p4", name: "Pulse Analytics", description: "Real-time user analytics", status: "active", ownerId: "u1", createdAt: "2026-03-18", updatedAt: "2026-09-10" },
];

export default function ProjectsPage() {
  const storeProjects = useSaaSStore((s) => s.projects);
  const storeSelectedProject = useSaaSStore((s) => s.selectedProject);
  const storeSearchQuery = useSaaSStore((s) => s.searchQuery);
  const storeFilters = useSaaSStore((s) => s.filters);
  const storeCurrentPage = useSaaSStore((s) => s.currentPage);
  const storeIsLoading = useSaaSStore((s) => s.isLoading);
  const storeIsSubmitting = useSaaSStore((s) => s.isSubmitting);
  const setProjects = useSaaSStore((s) => s.setProjects);
  const setSelectedProject = useSaaSStore((s) => s.setSelectedProject);
  const setIsSubmitting = useSaaSStore((s) => s.setIsSubmitting);
  const pushToast = useSaaSStore((s) => s.pushToast);

  const projects = storeProjects.length ? storeProjects : mockProjects;

  const handleCreateProject: ProjectsPageProps["onCreate"] = (newProject) => {
    setIsSubmitting(true);
    const createdProject: Project = {
      id: `p${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...newProject,
    };
    setProjects([createdProject, ...projects]);
    setIsSubmitting(false);
    pushToast({ kind: "success", title: "Project created", msg: `${createdProject.name} added` });
  };

  const handleUpdateProject: ProjectsPageProps["onUpdate"] = (projectToUpdate) => {
    setProjects(projects.map((project) => (project.id === projectToUpdate.id ? { ...project, updatedAt: new Date().toISOString() } : project)));
    pushToast({ kind: "info", title: "Project updated", msg: projectToUpdate.name });
  };

  const handleDeleteProject: ProjectsPageProps["onDelete"] = (projectToDelete) => {
    setProjects(projects.filter((project) => project.id !== projectToDelete.id));
    if (storeSelectedProject?.id === projectToDelete.id) setSelectedProject(null);
    pushToast({ kind: "warn", title: "Project removed", msg: projectToDelete.name });
  };

  const handleSelectProject: ProjectsPageProps["onSelect"] = (projectToSelect) => {
    setSelectedProject(projectToSelect);
  };

  return (
    <div style={{ padding: 32, textAlign: "left" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <FolderKanban size={28} style={{ color: "var(--accent)" }} />
        <h1 style={{ margin: 0, fontSize: 32 }}>Projects</h1>
      </div>
      <ProjectsContent
        projects={projects}
        selectedProject={storeSelectedProject}
        searchQuery={storeSearchQuery}
        filters={storeFilters}
        currentPage={storeCurrentPage}
        isLoading={storeIsLoading}
        isSubmitting={storeIsSubmitting}
        onCreate={handleCreateProject}
        onUpdate={handleUpdateProject}
        onDelete={handleDeleteProject}
        onSelect={handleSelectProject}
      />
    </div>
  );
}
