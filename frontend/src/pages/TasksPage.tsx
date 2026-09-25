import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useSaaSStore, type Task, type Project, type TeamMember, type Filters } from "../store";
import { apiClient } from "../api/apiClient";
import { ClipboardList, Plus, CheckCircle2, Clock, CircleDashed, Trash2, Pencil, ArrowRight } from "lucide-react";
import { PageHeader, Card, Reveal, SearchField, EmptyState, LoadingState, ErrorState } from "../components/ui/primitives";
import Modal from "../components/ui/Modal";

const STATUS_META: Record<Task["status"], { label: string; badge: string }> = {
  todo: { label: "To do", badge: "badge-neutral" },
  in_progress: { label: "In progress", badge: "badge-info" },
  done: { label: "Done", badge: "badge-success" },
};

const PRIORITY_BADGE: Record<Task["priority"], string> = {
  low: "badge-neutral",
  medium: "badge-warning",
  high: "badge-danger",
};

const TASK_STATUSES: Array<Task["status"]> = ["todo", "in_progress", "done"];
const TASK_PRIORITIES: Array<Task["priority"]> = ["low", "medium", "high"];

export interface TaskFormValues {
  title: string;
  description: string;
  projectId: string;
  assigneeId: string | null;
  status: Task["status"];
  priority: Task["priority"];
  dueDate: string | null;
}

function toDateInputValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function TaskForm({
  initial,
  projects,
  teamMembers,
  submitLabel,
  isSubmitting,
  onSubmit,
}: {
  initial: TaskFormValues;
  projects: Project[];
  teamMembers: TeamMember[];
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (values: TaskFormValues) => void;
}) {
  const [form, setForm] = useState<TaskFormValues>(initial);
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Task title is required.");
      return;
    }
    if (!form.projectId) {
      setError("Choose a project for this task.");
      return;
    }
    setError("");
    onSubmit({
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      assigneeId: form.assigneeId || null,
      dueDate: form.dueDate || null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="task-title" className="field-label">Title</label>
        <input
          id="task-title"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="e.g. Design onboarding flow"
          maxLength={200}
          required
          className="input"
        />
      </div>
      <div>
        <label htmlFor="task-desc" className="field-label">Description</label>
        <textarea
          id="task-desc"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="What needs to be done?"
          rows={3}
          className="textarea"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="task-project" className="field-label">Project</label>
          <select
            id="task-project"
            value={form.projectId}
            onChange={(e) => setForm((f) => ({ ...f, projectId: e.target.value }))}
            required
            className="select"
          >
            <option value="" disabled>Select a project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="task-assignee" className="field-label">Assignee</label>
          <select
            id="task-assignee"
            value={form.assigneeId ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, assigneeId: e.target.value || null }))}
            className="select"
          >
            <option value="">Unassigned</option>
            {teamMembers.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="task-status" className="field-label">Status</label>
          <select
            id="task-status"
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Task["status"] }))}
            className="select"
          >
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_META[s].label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="task-priority" className="field-label">Priority</label>
          <select
            id="task-priority"
            value={form.priority}
            onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as Task["priority"] }))}
            className="select"
          >
            {TASK_PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="task-due" className="field-label">Due date</label>
        <input
          id="task-due"
          type="date"
          value={toDateInputValue(form.dueDate)}
          onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value || null }))}
          className="input"
        />
      </div>
      {error && <p className="text-[13px] font-medium text-[var(--danger)]" role="alert">{error}</p>}
      <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full !py-2.5">
        {isSubmitting ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}

interface TaskRowProps {
  task: Task;
  project: Project | undefined;
  assignee: TeamMember | undefined;
  onStatusChange: (taskToUpdate: Task) => void;
  onEdit: (taskToEdit: Task) => void;
  onDelete: (taskToDelete: Task) => void;
  onSelect: (selectedTask: Task) => void;
}

function TaskRow({ task, project, assignee, onStatusChange, onEdit, onDelete, onSelect }: TaskRowProps) {
  const statusIcon =
    task.status === "done" ? (
      <CheckCircle2 size={16} className="shrink-0 text-[var(--success)]" aria-hidden />
    ) : task.status === "in_progress" ? (
      <Clock size={16} className="shrink-0 text-[var(--info)]" aria-hidden />
    ) : (
      <CircleDashed size={16} className="shrink-0 text-[var(--text-muted)]" aria-hidden />
    );
  return (
    <Reveal>
      <div
        onClick={() => onSelect(task)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(task);
          }
        }}
        className="card card-hover flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className="mt-0.5">{statusIcon}</span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-[var(--text-h)]">{task.title}</span>
              <span className={`badge ${PRIORITY_BADGE[task.priority]}`}>{task.priority}</span>
            </div>
            <p className="mt-0.5 line-clamp-1 text-[13px] text-[var(--text)]">{task.description}</p>
            <p className="mt-1.5 text-xs text-[var(--text-muted)]">
              {project?.name ?? "Unknown project"}
              {assignee ? ` · ${assignee.name}` : ""}
              {" · Due "}{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 pl-7 sm:pl-0" onClick={(e) => e.stopPropagation()}>
          <select
            value={task.status}
            onChange={(statusEvent) => onStatusChange({ ...task, status: statusEvent.target.value as Task["status"] })}
            aria-label={`Status for ${task.title}`}
            className="select !w-auto !py-2 text-xs font-semibold"
          >
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_META[s].label}</option>
            ))}
          </select>
          <button
            onClick={() => onEdit(task)}
            aria-label={`Edit ${task.title}`}
            title="Edit task"
            className="icon-btn !h-9 !w-9"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onDelete(task)}
            aria-label={`Delete ${task.title}`}
            title="Delete"
            className="icon-btn !h-9 !w-9 hover:!border-[var(--danger-bg)] hover:!bg-[var(--danger-bg)] hover:!text-[var(--danger)]"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </Reveal>
  );
}

interface TasksPageProps {
  tasks: Task[];
  projects: Project[];
  teamMembers: TeamMember[];
  selectedProject: Project | null;
  searchQuery: string;
  filters: Filters;
  currentPage: number;
  isLoading: boolean;
  isSubmitting: boolean;
  fetchError: string | null;
  onCreate: (values: TaskFormValues) => void;
  onUpdate: (taskId: string, values: Partial<TaskFormValues> & { status?: Task["status"] }) => void;
  onDelete: (taskToDelete: Task) => void;
  onSelect: (selectedTask: Task) => void;
  onRetry: () => void;
}

function TasksContent({ tasks, projects, teamMembers, selectedProject, searchQuery, filters, currentPage, isLoading, isSubmitting, fetchError, onCreate, onUpdate, onDelete, onSelect, onRetry }: TasksPageProps) {
  const [taskSearchQuery, setTaskSearchQuery] = useState(searchQuery);
  const setFilters = useSaaSStore((s) => s.setFilters);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const filteredTasks = useMemo(() => {
    const normalizedSearch = taskSearchQuery.toLowerCase();
    return tasks.filter((task) => {
      const matchesSearch = !normalizedSearch || task.title.toLowerCase().includes(normalizedSearch) || task.description.toLowerCase().includes(normalizedSearch);
      const matchesProject = !selectedProject || task.projectId === selectedProject.id;
      const matchesStatus = filters.status === "all" || task.status === filters.status;
      const matchesPriority = filters.priority === "all" || task.priority === filters.priority;
      return matchesSearch && matchesProject && matchesStatus && matchesPriority;
    });
  }, [tasks, taskSearchQuery, selectedProject, filters]);

  const paginatedTasks = useMemo(() => {
    const pageSize = 8;
    const start = (currentPage - 1) * pageSize;
    return filteredTasks.slice(start, start + pageSize);
  }, [filteredTasks, currentPage]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { todo: 0, in_progress: 0, done: 0 };
    filteredTasks.forEach((t) => {
      counts[t.status] = (counts[t.status] ?? 0) + 1;
    });
    return counts;
  }, [filteredTasks]);

  if (isLoading) return <LoadingState message="Loading tasks…" rows={5} />;

  if (fetchError) return <ErrorState message={fetchError} onRetry={onRetry} />;

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-3 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchField value={taskSearchQuery} onChange={setTaskSearchQuery} placeholder="Search tasks…" label="Search tasks" />
          <button
            onClick={() => setShowCreate(true)}
            disabled={isSubmitting || projects.length === 0}
            className="btn btn-primary shrink-0"
            title={projects.length === 0 ? "Create a project first" : "Create a new task"}
          >
            <Plus size={16} aria-hidden /> {isSubmitting ? "Creating…" : "New task"}
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5" aria-label="Task status summary">
            {(Object.keys(STATUS_META) as Array<Task["status"]>).map((s) => (
              <span key={s} className={`badge ${STATUS_META[s].badge}`}>
                {STATUS_META[s].label} · {statusCounts[s] ?? 0}
              </span>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              aria-label="Filter tasks by status"
              className="select !w-auto !py-2 text-xs font-medium"
            >
              <option value="all">All statuses</option>
              {TASK_STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_META[s].label}</option>
              ))}
            </select>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              aria-label="Filter tasks by priority"
              className="select !w-auto !py-2 text-xs font-medium"
            >
              <option value="all">All priorities</option>
              {TASK_PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {selectedProject && (
        <p className="anim-fade text-xs text-[var(--text-muted)]">
          Filtering by project: <strong className="text-[var(--text-h)]">{selectedProject.name}</strong>
        </p>
      )}

      <div className="flex flex-col gap-2.5">
        {paginatedTasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            project={projects.find((project) => project.id === task.projectId)}
            assignee={teamMembers.find((m) => m.id === task.assigneeId)}
            onStatusChange={(t) => onUpdate(t.id, { status: t.status })}
            onEdit={setEditing}
            onDelete={onDelete}
            onSelect={onSelect}
          />
        ))}
        {paginatedTasks.length === 0 && (
          <Card>
            <EmptyState
              icon={<ClipboardList className="h-5 w-5" aria-hidden />}
              title="No tasks found"
              message="Adjust your filters or create a new task to keep delivery moving."
            />
          </Card>
        )}
      </div>
      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-[var(--text-muted)]">
        Page {currentPage} <ArrowRight size={12} aria-hidden /> {filteredTasks.length} tasks
      </p>

      {showCreate && (
        <Modal title="New task" subtitle="Tasks are stored in the database and appear instantly." onClose={() => setShowCreate(false)} wide>
          <TaskForm
            initial={{
              title: "",
              description: "",
              projectId: selectedProject?.id ?? projects[0]?.id ?? "",
              assigneeId: null,
              status: "todo",
              priority: "medium",
              dueDate: null,
            }}
            projects={projects}
            teamMembers={teamMembers}
            submitLabel="Create task"
            isSubmitting={isSubmitting}
            onSubmit={(values) => {
              onCreate(values);
              setShowCreate(false);
            }}
          />
        </Modal>
      )}
      {editing && (
        <Modal title="Edit task" subtitle={editing.title} onClose={() => setEditing(null)} wide>
          <TaskForm
            initial={{
              title: editing.title,
              description: editing.description,
              projectId: editing.projectId,
              assigneeId: editing.assigneeId,
              status: editing.status,
              priority: editing.priority,
              dueDate: editing.dueDate,
            }}
            projects={projects}
            teamMembers={teamMembers}
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

export default function TasksPage() {
  const tasks = useSaaSStore((s) => s.tasks);
  const projects = useSaaSStore((s) => s.projects);
  const teamMembers = useSaaSStore((s) => s.teamMembers);
  const selectedProject = useSaaSStore((s) => s.selectedProject);
  const searchQuery = useSaaSStore((s) => s.searchQuery);
  const filters = useSaaSStore((s) => s.filters);
  const currentPage = useSaaSStore((s) => s.currentPage);
  const isSubmitting = useSaaSStore((s) => s.isSubmitting);
  const setTasks = useSaaSStore((s) => s.setTasks);
  const setProjects = useSaaSStore((s) => s.setProjects);
  const setTeamMembers = useSaaSStore((s) => s.setTeamMembers);
  const setIsLoading = useSaaSStore((s) => s.setIsLoading);
  const setIsSubmitting = useSaaSStore((s) => s.setIsSubmitting);
  const pushToast = useSaaSStore((s) => s.pushToast);

  const [isLoading, setLocalLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchData = async () => {
    setLocalLoading(true);
    setIsLoading(true);
    setFetchError(null);
    try {
      const [tasksData, projectsData, teamData]: any = await Promise.all([
        apiClient("/api/tasks"),
        apiClient("/api/projects"),
        apiClient("/api/team"),
      ]);
      setTasks(tasksData.tasks ?? []);
      setProjects(projectsData.projects ?? []);
      setTeamMembers(teamData.members ?? teamData.teamMembers ?? []);
    } catch (e: any) {
      const message = e?.message || "Unable to load tasks from the database.";
      setFetchError(message);
      pushToast({ kind: "error", title: "Failed to load tasks", msg: message });
    } finally {
      setLocalLoading(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTask: TasksPageProps["onCreate"] = async (values) => {
    setIsSubmitting(true);
    try {
      const data: any = await apiClient("/api/tasks", values, "POST");
      const created: Task = data.task;
      setTasks([created, ...tasks]);
      pushToast({ kind: "success", title: "Task created", msg: created.title });
    } catch (e: any) {
      pushToast({ kind: "error", title: "Create failed", msg: e.message });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleUpdateTask: TasksPageProps["onUpdate"] = async (taskId, values) => {
    if (!taskId) return;
    try {
      const task = tasks.find((t) => t.id === taskId);
      const payload = task
        ? {
            title: values.title ?? task.title,
            description: values.description ?? task.description,
            projectId: values.projectId ?? task.projectId,
            assigneeId: values.assigneeId !== undefined ? values.assigneeId : task.assigneeId,
            status: values.status ?? task.status,
            priority: values.priority ?? task.priority,
            dueDate: values.dueDate !== undefined ? values.dueDate : task.dueDate,
          }
        : values;
      const data: any = await apiClient(`/api/tasks/${taskId}`, payload, "PUT");
      const updated: Task = data.task;
      setTasks(tasks.map((t) => (t.id === updated.id ? updated : t)));
      pushToast({ kind: "success", title: "Task updated", msg: updated.title });
    } catch (e: any) {
      pushToast({ kind: "error", title: "Update failed", msg: e.message });
    }
  };
  const handleDeleteTask: TasksPageProps["onDelete"] = async (taskToDelete) => {
    try {
      await apiClient(`/api/tasks/${taskToDelete.id}`, undefined, "DELETE");
      setTasks(tasks.filter((task) => task.id !== taskToDelete.id));
      pushToast({ kind: "warn", title: "Task removed", msg: taskToDelete.title });
    } catch (e: any) {
      pushToast({ kind: "error", title: "Delete failed", msg: e.message });
    }
  };
  const handleSelectTask: TasksPageProps["onSelect"] = (selectedTask) => {
    pushToast({ kind: "info", title: "Task selected", msg: selectedTask.title });
  };

  return (
    <div className="page-wrap">
      <div className="mx-auto max-w-[1280px]">
        <PageHeader
          eyebrow="Delivery"
          title="Tasks"
          description="Every deliverable with an owner, a priority and a due date."
          actions={<span className="badge badge-accent">{tasks.length} total</span>}
        />
        <div className="mt-5">
          <TasksContent
            tasks={tasks}
            projects={projects}
            teamMembers={teamMembers}
            selectedProject={selectedProject}
            searchQuery={searchQuery}
            filters={filters}
            currentPage={currentPage}
            isLoading={isLoading}
            isSubmitting={isSubmitting}
            fetchError={fetchError}
            onCreate={handleCreateTask}
            onUpdate={handleUpdateTask}
            onDelete={handleDeleteTask}
            onSelect={handleSelectTask}
            onRetry={fetchData}
          />
        </div>
      </div>
    </div>
  );
}
