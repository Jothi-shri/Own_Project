import { useEffect, useMemo, useState } from "react";
import { useSaaSStore, type Project, type Filters } from "../store";
import { apiClient } from "../api/apiClient";
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

export default function ProjectsPage() {
  const storeProjects = useSaaSStore((s) => s.projects);
  const storeSelectedProject = useSaaSStore((s) => s.selectedProject);
  const storeSearchQuery = useSaaSStore((s) => s.searchQuery);
  const storeFilters = useSaaSStore((s) => s.filters);
  const storeCurrentPage = useSaaSStore((s) => s.currentPage);
  const storeIsSubmitting = useSaaSStore((s) => s.isSubmitting);
  const setProjects = useSaaSStore((s) => s.setProjects);
  const setSelectedProject = useSaaSStore((s) => s.setSelectedProject);
  const setIsSubmitting = useSaaSStore((s) => s.setIsSubmitting);
  const setIsLoading = useSaaSStore((s) => s.setIsLoading);
  const pushToast = useSaaSStore((s) => s.pushToast);

  const [isLoading, setLocalLoading] = useState(true);

  const fetchProjects = async () => {
    setLocalLoading(true);
    setIsLoading(true);
    try {
      const data: any = await apiClient("/api/projects");
      const list: Project[] = data.projects ?? [];
      setProjects(list);
    } catch (e: any) {
      pushToast({ kind: "error", title: "Failed to load projects", msg: e.message });
    } finally {
      setLocalLoading(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject: ProjectsPageProps["onCreate"] = async (newProject) => {
    setIsSubmitting(true);
    try {
      const data: any = await apiClient("/api/projects", { name: newProject.name, description: newProject.description, status: newProject.status }, "POST");
      const created: Project = data.project;
      setProjects([created, ...storeProjects]);
      pushToast({ kind: "success", title: "Project created", msg: created.name });
    } catch (e: any) {
      pushToast({ kind: "error", title: "Create failed", msg: e.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProject: ProjectsPageProps["onUpdate"] = async (projectToUpdate) => {
    // simple toggle demo: cycle status
    const nextStatus = projectToUpdate.status === "planning" ? "active" : projectToUpdate.status === "active" ? "completed" : "archived";
    try {
      const data: any = await apiClient(`/api/projects/${projectToUpdate.id}`, { status: nextStatus }, "PUT");
      const updated: Project = data.project;
      setProjects(storeProjects.map((p) => (p.id === updated.id ? updated : p)));
      pushToast({ kind: "info", title: "Project updated", msg: updated.name });
    } catch (e: any) {
      pushToast({ kind: "error", title: "Update failed", msg: e.message });
    }
  };

  const handleDeleteProject: ProjectsPageProps["onDelete"] = async (projectToDelete) => {
    try {
      await apiClient(`/api/projects/${projectToDelete.id}`, undefined, "DELETE");
      setProjects(storeProjects.filter((project) => project.id !== projectToDelete.id));
      if (storeSelectedProject?.id === projectToDelete.id) setSelectedProject(null);
      pushToast({ kind: "warn", title: "Project removed", msg: projectToDelete.name });
    } catch (e: any) {
      pushToast({ kind: "error", title: "Delete failed", msg: e.message });
    }
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
        projects={storeProjects}
        selectedProject={storeSelectedProject}
        searchQuery={storeSearchQuery}
        filters={storeFilters}
        currentPage={storeCurrentPage}
        isLoading={isLoading}
        isSubmitting={storeIsSubmitting}
        onCreate={handleCreateProject}
        onUpdate={handleUpdateProject}
        onDelete={handleDeleteProject}
        onSelect={handleSelectProject}
      />
    </div>
  );
}
