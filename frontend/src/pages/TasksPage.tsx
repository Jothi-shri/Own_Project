import { useEffect, useMemo, useState } from "react";
import { useSaaSStore, type Task, type Project, type Filters } from "../store";
import { apiClient } from "../api/apiClient";
import { ClipboardList, Plus, Search, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

interface TaskRowProps {
  task: Task;
  project: Project | undefined;
  onUpdate: (taskToUpdate: Task) => void;
  onDelete: (taskToDelete: Task) => void;
  onSelect: (selectedTask: Task) => void;
}

function TaskRow({ task, project, onUpdate, onDelete, onSelect }: TaskRowProps) {
  const statusIcon =
    task.status === "done" ? <CheckCircle2 size={14} style={{ color: "var(--nv-green)" }} /> : task.status === "in_progress" ? <Clock size={14} style={{ color: "var(--amber)" }} /> : <AlertTriangle size={14} style={{ color: "var(--text)" }} />;
  return (
    <div
      onClick={() => onSelect(task)}
      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", border: "1px solid var(--border)", borderRadius: 10, background: "var(--code-bg)", cursor: "pointer", gap: 12 }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, color: "var(--text-h)", display: "flex", alignItems: "center", gap: 6 }}>
          {statusIcon} {task.title}
        </div>
        <div style={{ fontSize: 12, color: "var(--text)", marginTop: 2 }}>{task.description}</div>
        <div style={{ fontSize: 11, color: "var(--auth-text-muted)", marginTop: 4 }}>
          Project: {project?.name ?? task.projectId} • Priority: {task.priority} • Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <select
          value={task.status}
          onClick={(e) => e.stopPropagation()}
          onChange={(statusEvent) => onUpdate({ ...task, status: statusEvent.target.value as Task["status"] })}
          style={{ padding: "6px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg)", fontSize: 12 }}
        >
          <option value="todo">Todo</option>
          <option value="in_progress">In progress</option>
          <option value="done">Done</option>
        </select>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task);
          }}
          style={{ padding: "6px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg)", cursor: "pointer", fontSize: 12 }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

interface TasksPageProps {
  tasks: Task[];
  projects: Project[];
  selectedProject: Project | null;
  searchQuery: string;
  filters: Filters;
  currentPage: number;
  isLoading: boolean;
  isSubmitting: boolean;
  onCreate: (newTask: Omit<Task, "id">) => void;
  onUpdate: (taskToUpdate: Task) => void;
  onDelete: (taskToDelete: Task) => void;
  onSelect: (selectedTask: Task) => void;
}

function TasksContent({ tasks, projects, selectedProject, searchQuery, filters, currentPage, isLoading, isSubmitting, onCreate, onUpdate, onDelete, onSelect }: TasksPageProps) {
  const [taskSearchQuery, setTaskSearchQuery] = useState(searchQuery);

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

  if (isLoading) return <div style={{ padding: 16 }}>Loading tasks…</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 240 }}>
          <Search size={16} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--auth-text-muted)" }} />
          <input
            value={taskSearchQuery}
            onChange={(e) => setTaskSearchQuery(e.target.value)}
            placeholder="Search tasks…"
            style={{ width: "100%", padding: "10px 12px 10px 32px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--auth-input-bg)", color: "var(--text-h)" }}
          />
        </div>
        <button
          onClick={() =>
            onCreate({
              title: `New task ${tasks.length + 1}`,
              description: "Task description for SaaS workflow",
              projectId: selectedProject?.id ?? projects[0]?.id ?? "p1",
              assigneeId: null,
              status: "todo",
              priority: "medium",
              dueDate: null,
            })
          }
          disabled={isSubmitting || projects.length === 0}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 14px", borderRadius: 8, border: "none", background: "var(--accent)", color: "#fff", cursor: "pointer", fontWeight: 700 }}
        >
          <Plus size={16} /> {isSubmitting ? "Creating…" : "Create task"}
        </button>
      </div>

      {selectedProject && <div style={{ fontSize: 12, color: "var(--auth-text-muted)" }}>Filtering by project: <strong style={{ color: "var(--text-h)" }}>{selectedProject.name}</strong></div>}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {paginatedTasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            project={projects.find((project) => project.id === task.projectId)}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onSelect={onSelect}
          />
        ))}
        {paginatedTasks.length === 0 && <div style={{ textAlign: "center", color: "var(--auth-text-muted)", padding: 24 }}>No tasks found.</div>}
      </div>
      <div style={{ fontSize: 12, textAlign: "center", color: "var(--auth-text-muted)" }}>Page {currentPage} • {filteredTasks.length} tasks</div>
    </div>
  );
}

export default function TasksPage() {
  const tasks = useSaaSStore((s) => s.tasks);
  const projects = useSaaSStore((s) => s.projects);
  const selectedProject = useSaaSStore((s) => s.selectedProject);
  const searchQuery = useSaaSStore((s) => s.searchQuery);
  const filters = useSaaSStore((s) => s.filters);
  const currentPage = useSaaSStore((s) => s.currentPage);
  const isSubmitting = useSaaSStore((s) => s.isSubmitting);
  const setTasks = useSaaSStore((s) => s.setTasks);
  const setProjects = useSaaSStore((s) => s.setProjects);
  const setIsLoading = useSaaSStore((s) => s.setIsLoading);
  const setIsSubmitting = useSaaSStore((s) => s.setIsSubmitting);
  const pushToast = useSaaSStore((s) => s.pushToast);

  const [isLoading, setLocalLoading] = useState(true);

  const fetchData = async () => {
    setLocalLoading(true);
    setIsLoading(true);
    try {
      const [tasksData, projectsData]: any = await Promise.all([
        apiClient("/api/tasks"),
        apiClient("/api/projects"),
      ]);
      setTasks(tasksData.tasks ?? []);
      setProjects(projectsData.projects ?? []);
    } catch (e: any) {
      pushToast({ kind: "error", title: "Failed to load tasks", msg: e.message });
    } finally {
      setLocalLoading(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTask: TasksPageProps["onCreate"] = async (newTask) => {
    setIsSubmitting(true);
    try {
      const data: any = await apiClient("/api/tasks", newTask, "POST");
      const created: Task = data.task;
      setTasks([created, ...tasks]);
      pushToast({ kind: "success", title: "Task created", msg: created.title });
    } catch (e: any) {
      pushToast({ kind: "error", title: "Create failed", msg: e.message });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleUpdateTask: TasksPageProps["onUpdate"] = async (taskToUpdate) => {
    if (!taskToUpdate.id) return;
    try {
      const data: any = await apiClient(`/api/tasks/${taskToUpdate.id}`, taskToUpdate, "PUT");
      const updated: Task = data.task;
      setTasks(tasks.map((task) => (task.id === updated.id ? updated : task)));
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
    <div style={{ padding: 32, textAlign: "left" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <ClipboardList size={28} style={{ color: "var(--accent)" }} />
        <h1 style={{ margin: 0, fontSize: 32 }}>Tasks</h1>
      </div>
      <TasksContent
        tasks={tasks}
        projects={projects}
        selectedProject={selectedProject}
        searchQuery={searchQuery}
        filters={filters}
        currentPage={currentPage}
        isLoading={isLoading}
        isSubmitting={isSubmitting}
        onCreate={handleCreateTask}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
        onSelect={handleSelectTask}
      />
    </div>
  );
}
