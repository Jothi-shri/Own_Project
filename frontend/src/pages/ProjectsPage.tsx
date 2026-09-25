import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useSaaSStore, type Project, type Filters } from "../store";
import { apiClient } from "../api/apiClient";
import { FolderKanban, Plus, Pencil, Trash2, Eye, ArrowRight } from "lucide-react";
import { PageHeader, Card, Reveal, SearchField, EmptyState, LoadingState, ErrorState } from "../components/ui/primitives";
import Modal from "../components/ui/Modal";

const STATUS_BADGE: Record<Project["status"], string> = {
  planning: "badge-info",
  active: "badge-success",
  completed: "badge-neutral",
  archived: "badge-warning",
};

const PROJECT_STATUSES: Array<Project["status"]> = ["planning", "active", "completed", "archived"];

export interface ProjectFormValues {
  name: string;
  description: string;
  status: Project["status"];
}

function ProjectForm({
  initial,
  submitLabel,
  isSubmitting,
  onSubmit,
}: {
  initial: ProjectFormValues;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (values: ProjectFormValues) => void;
}) {
  const [form, setForm] = useState<ProjectFormValues>(initial);
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Project name is required.");
      return;
    }
    setError("");
    onSubmit({ name: form.name.trim(), description: form.description.trim(), status: form.status });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="project-name" className="field-label">Project name</label>
        <input
          id="project-name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="e.g. Atlas CRM"
          maxLength={120}
          required
          className="input"
        />
      </div>
      <div>
        <label htmlFor="project-desc" className="field-label">Description</label>
        <textarea
          id="project-desc"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="What is this project about?"
          rows={3}
          className="textarea"
        />
      </div>
      <div>
        <label htmlFor="project-status" className="field-label">Status</label>
        <select
          id="project-status"
          value={form.status}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Project["status"] }))}
          className="select"
        >
          {PROJECT_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      {error && <p className="text-[13px] font-medium text-[var(--danger)]" role="alert">{error}</p>}
      <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full !py-2.5">
        {isSubmitting ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}

interface ProjectCardProps {
  project: Project;
  isSelected: boolean;
  onSelect: (selectedProject: Project) => void;
  onEdit: (projectToEdit: Project) => void;
  onDelete: (projectToDelete: Project) => void;
}

function ProjectCard({ project, isSelected, onSelect, onEdit, onDelete }: ProjectCardProps) {
  return (
    <Reveal>
      <div
        onClick={() => onSelect(project)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(project);
          }
        }}
        className={`card card-hover cursor-pointer p-4 sm:p-5 ${
          isSelected ? "!border-[var(--accent)] ring-2 ring-[var(--ring)]" : ""
        }`}
        aria-pressed={isSelected}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-bg)] text-[var(--accent)]">
              <FolderKanban size={18} aria-hidden />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="truncate text-[15px] font-bold text-[var(--text-h)]">{project.name}</span>
                <span className={`badge ${STATUS_BADGE[project.status]}`}>{project.status}</span>
              </div>
              <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-[var(--text)]">{project.description}</p>
              <p className="mt-2 text-xs text-[var(--text-muted)]">
                Updated {new Date(project.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(project);
              }}
              aria-label={`Edit ${project.name}`}
              title="Edit project"
              className="icon-btn !h-8 !w-8"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(project);
              }}
              aria-label={`Delete ${project.name}`}
              title="Delete"
              className="icon-btn !h-8 !w-8 hover:!border-[var(--danger-bg)] hover:!bg-[var(--danger-bg)] hover:!text-[var(--danger)]"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </Reveal>
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
  fetchError: string | null;
  onCreate: (values: ProjectFormValues) => void;
  onUpdate: (projectId: string, values: ProjectFormValues) => void;
  onDelete: (projectToDelete: Project) => void;
  onSelect: (selectedProject: Project) => void;
  onRetry: () => void;
}

function ProjectsContent({
  projects,
  selectedProject,
  searchQuery,
  filters,
  currentPage,
  isLoading,
  isSubmitting,
  fetchError,
  onCreate,
  onUpdate,
  onDelete,
  onSelect,
  onRetry,
}: ProjectsPageProps) {
  const [projectSearchInput, setProjectSearchInput] = useState(searchQuery);
  const [statusFilter, setStatusFilter] = useState<string>(filters.status);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);

  const filteredProjects = useMemo(() => {
    const normalizedQuery = projectSearchInput.toLowerCase();
    return projects.filter((project) => {
      const matchesSearch =
        !normalizedQuery || project.name.toLowerCase().includes(normalizedQuery) || project.description.toLowerCase().includes(normalizedQuery);
      const matchesStatus = statusFilter === "all" || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, projectSearchInput, statusFilter]);

  const paginatedProjects = useMemo(() => {
    const pageSize = 6;
    const startIndex = (currentPage - 1) * pageSize;
    return filteredProjects.slice(startIndex, startIndex + pageSize);
  }, [filteredProjects, currentPage]);

  if (isLoading) {
    return <LoadingState message="Loading projects…" rows={4} />;
  }

  if (fetchError) {
    return <ErrorState message={fetchError} onRetry={onRetry} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
        <SearchField value={projectSearchInput} onChange={setProjectSearchInput} placeholder="Search projects…" label="Search projects" />
        <div className="flex shrink-0 items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
            className="select !w-auto !py-2.5 text-[13px] font-medium"
          >
            <option value="all">All statuses</option>
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button onClick={() => setShowCreate(true)} disabled={isSubmitting} className="btn btn-primary">
            <Plus size={16} aria-hidden /> New project
          </button>
        </div>
      </Card>

      {selectedProject && (
        <div className="anim-fade flex items-center gap-2.5 rounded-xl border border-[var(--accent-border)] bg-[var(--accent-bg)] px-4 py-3 text-sm">
          <Eye size={16} className="shrink-0 text-[var(--accent)]" aria-hidden />
          <span className="text-[var(--text)]">
            Selected: <strong className="text-[var(--text-h)]">{selectedProject.name}</strong>
            <span className="hidden sm:inline"> — {selectedProject.description}</span>
          </span>
        </div>
      )}

      <div className="grid gap-3">
        {paginatedProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            isSelected={selectedProject?.id === project.id}
            onSelect={onSelect}
            onEdit={setEditing}
            onDelete={onDelete}
          />
        ))}
        {paginatedProjects.length === 0 && (
          <Card>
            <EmptyState
              icon={<FolderKanban className="h-5 w-5" aria-hidden />}
              title="No projects match your filters"
              message="Try a different search, or create a new project to get started."
              action={
                <button onClick={() => setShowCreate(true)} className="btn btn-primary !py-2 text-xs">
                  <Plus size={14} aria-hidden /> Create project
                </button>
              }
            />
          </Card>
        )}
      </div>

      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-[var(--text-muted)]">
        Page {currentPage} <ArrowRight size={12} aria-hidden /> {filteredProjects.length} projects total
      </p>

      {showCreate && (
        <Modal title="New project" subtitle="Projects are stored in the database and appear instantly." onClose={() => setShowCreate(false)}>
          <ProjectForm
            initial={{ name: "", description: "", status: "planning" }}
            submitLabel="Create project"
            isSubmitting={isSubmitting}
            onSubmit={(values) => {
              onCreate(values);
              setShowCreate(false);
            }}
          />
        </Modal>
      )}
      {editing && (
        <Modal title="Edit project" subtitle={editing.name} onClose={() => setEditing(null)}>
          <ProjectForm
            initial={{ name: editing.name, description: editing.description, status: editing.status }}
            submitLabel="Save changes"
            isSubmitting={isSubmitting}
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
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchProjects = async () => {
    setLocalLoading(true);
    setIsLoading(true);
    setFetchError(null);
    try {
      const data: any = await apiClient("/api/projects");
      const list: Project[] = data.projects ?? [];
      setProjects(list);
    } catch (e: any) {
      const message = e?.message || "Unable to load projects from the database.";
      setFetchError(message);
      pushToast({ kind: "error", title: "Failed to load projects", msg: message });
    } finally {
      setLocalLoading(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject: ProjectsPageProps["onCreate"] = async (values) => {
    setIsSubmitting(true);
    try {
      const data: any = await apiClient("/api/projects", values, "POST");
      const created: Project = data.project;
      setProjects([created, ...storeProjects]);
      pushToast({ kind: "success", title: "Project created", msg: created.name });
    } catch (e: any) {
      pushToast({ kind: "error", title: "Create failed", msg: e.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProject: ProjectsPageProps["onUpdate"] = async (projectId, values) => {
    try {
      const data: any = await apiClient(`/api/projects/${projectId}`, values, "PUT");
      const updated: Project = data.project;
      setProjects(storeProjects.map((p) => (p.id === updated.id ? updated : p)));
      if (storeSelectedProject?.id === updated.id) setSelectedProject(updated);
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
    <div className="page-wrap">
      <div className="mx-auto max-w-[1280px]">
        <PageHeader
          eyebrow="Workspace"
          title="Projects"
          description="Plan, track and ship your work — select a project to filter tasks."
          actions={
            <span className="badge badge-accent">{storeProjects.length} total</span>
          }
        />
        <div className="mt-5">
          <ProjectsContent
            projects={storeProjects}
            selectedProject={storeSelectedProject}
            searchQuery={storeSearchQuery}
            filters={storeFilters}
            currentPage={storeCurrentPage}
            isLoading={isLoading}
            isSubmitting={storeIsSubmitting}
            fetchError={fetchError}
            onCreate={handleCreateProject}
            onUpdate={handleUpdateProject}
            onDelete={handleDeleteProject}
            onSelect={handleSelectProject}
            onRetry={fetchProjects}
          />
        </div>
      </div>
    </div>
  );
}
