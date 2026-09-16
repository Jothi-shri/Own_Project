import { useMemo, useState } from "react";
import { useSaaSStore, type Task, type Project, type Filters } from "../store";
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
          Project: {project?.name ?? task.projectId} • Priority: {task.priority} • Due: {task.dueDate ?? "—"}
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

const mockTasks: Task[] = [
  { id: "t1", title: "Design onboarding flow", description: "Wireframes for new signup", projectId: "p1", assigneeId: "tm1", status: "in_progress", priority: "high", dueDate: "2026-09-20" },
  { id: "t2", title: "Integrate billing webhook", description: "Stripe events to analytics", projectId: "p1", assigneeId: "tm2", status: "todo", priority: "medium", dueDate: "2026-09-28" },
  { id: "t3", title: "QA analytics dashboard", description: "Test revenue charts", projectId: "p4", assigneeId: "tm3", status: "done", priority: "low", dueDate: "2026-09-10" },
];

const mockProjectsForTasks: Project[] = [
  { id: "p1", name: "Atlas CRM", description: "CRM", status: "active", ownerId: "u1", createdAt: "2026-01-10", updatedAt: "2026-09-01" },
  { id: "p4", name: "Pulse Analytics", description: "Analytics", status: "active", ownerId: "u1", createdAt: "2026-03-18", updatedAt: "2026-09-10" },
];

function TasksContent({ tasks, selectedProject, searchQuery, filters, currentPage, isLoading, isSubmitting, onCreate, onUpdate, onDelete, onSelect }: TasksPageProps) {
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
        <select value={filters.status} onChange={(e) => onUpdate({ id: "", title: "", description: "", projectId: "", assigneeId: null, status: e.target.value as Task["status"], priority: "medium", dueDate: null } as never)} style={{ display: "none" }} />
        <button
          onClick={() =>
            onCreate({
              title: `New task ${tasks.length + 1}`,
              description: "Task description for SaaS workflow",
              projectId: selectedProject?.id ?? "p1",
              assigneeId: null,
              status: "todo",
              priority: "medium",
              dueDate: null,
            })
          }
          disabled={isSubmitting}
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
            project={mockProjectsForTasks.find((project) => project.id === task.projectId)}
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
  const selectedProject = useSaaSStore((s) => s.selectedProject);
  const searchQuery = useSaaSStore((s) => s.searchQuery);
  const filters = useSaaSStore((s) => s.filters);
  const currentPage = useSaaSStore((s) => s.currentPage);
  const isLoading = useSaaSStore((s) => s.isLoading);
  const isSubmitting = useSaaSStore((s) => s.isSubmitting);
  const setTasks = useSaaSStore((s) => s.setTasks);
  const pushToast = useSaaSStore((s) => s.pushToast);

  const taskList = tasks.length ? tasks : mockTasks;

  const handleCreateTask: TasksPageProps["onCreate"] = (newTask) => {
    const createdTask: Task = { id: `t${Date.now()}`, ...newTask };
    setTasks([createdTask, ...taskList]);
    pushToast({ kind: "success", title: "Task created", msg: createdTask.title });
  };
  const handleUpdateTask: TasksPageProps["onUpdate"] = (taskToUpdate) => {
    if (!taskToUpdate.id) return;
    setTasks(taskList.map((task) => (task.id === taskToUpdate.id ? taskToUpdate : task)));
  };
  const handleDeleteTask: TasksPageProps["onDelete"] = (taskToDelete) => {
    setTasks(taskList.filter((task) => task.id !== taskToDelete.id));
    pushToast({ kind: "warn", title: "Task removed", msg: taskToDelete.title });
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
        tasks={taskList}
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
