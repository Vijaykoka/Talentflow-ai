"use client";

import { useEffect, useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  IconColumns,
  IconDotsVertical,
  IconBriefcase,
  IconMapPin,
  IconCurrencyDollar,
  IconUser,
  IconArrowRight,
} from "@tabler/icons-react";

const COLUMNS = [
  { id: "OPEN", label: "Open", color: "#185FA5", bgColor: "var(--color-blue-light)" },
  { id: "IN_PROGRESS", label: "In Progress", color: "#534AB7", bgColor: "var(--color-purple-light)" },
  { id: "INTERVIEW", label: "Interview", color: "#EF9F27", bgColor: "var(--color-amber-light)" },
  { id: "OFFER", label: "Offer", color: "#1D9E75", bgColor: "var(--color-teal-light)" },
  { id: "FILLED", label: "Filled", color: "#639922", bgColor: "var(--color-green-light)" },
];

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: "#E24B4A",
  MEDIUM: "#EF9F27",
  LOW: "#639922",
};

function parseSkills(skills: string | string[]): string[] {
  if (Array.isArray(skills)) return skills;
  try { return JSON.parse(skills); } catch { return []; }
}

function SortableCard({ demand }: { demand: any }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: demand.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const skills = parseSkills(demand.requiredSkills);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="kanban-card"
    >
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: PRIORITY_COLORS[demand.priority] || "#888",
            flexShrink: 0,
          }}
        />
        <span className="kanban-card-title">{demand.title}</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "3px", fontSize: "10px", color: "var(--color-text-secondary)" }}>
        {demand.location && (
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <IconMapPin size={10} /> {demand.location}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <IconCurrencyDollar size={10} /> ${demand.rateMin}-{demand.rateMax}/hr
        </div>
      </div>

      {skills.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "3px", marginTop: "6px" }}>
          {skills.slice(0, 3).map((skill: string) => (
            <span key={skill} className="tag tag-blue" style={{ fontSize: "8px", padding: "1px 5px" }}>
              {skill}
            </span>
          ))}
          {skills.length > 3 && (
            <span className="tag" style={{ fontSize: "8px", padding: "1px 5px", background: "var(--color-background-secondary)", color: "var(--color-text-tertiary)" }}>
              +{skills.length - 3}
            </span>
          )}
        </div>
      )}

      {demand.vendor && (
        <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "6px", fontSize: "9px", color: "var(--color-text-tertiary)" }}>
          <IconUser size={9} /> {demand.vendor.name}
        </div>
      )}
    </div>
  );
}

function Column({
  column,
  demands,
  isOver,
}: {
  column: { id: string; label: string; color: string; bgColor: string };
  demands: any[];
  isOver: boolean;
}) {
  return (
    <div
      className="kanban-column"
      style={{
        borderColor: isOver ? column.color : "var(--color-border-tertiary)",
        background: isOver ? `${column.bgColor}88` : "var(--color-background-primary)",
      }}
    >
      <div className="kanban-column-header" style={{ borderBottomColor: column.color }}>
        <div
          className="kanban-column-dot"
          style={{ background: column.color }}
        />
        <span className="kanban-column-label">{column.label}</span>
        <span
          className="kanban-column-count"
          style={{ background: column.bgColor, color: column.color }}
        >
          {demands.length}
        </span>
      </div>
      <div className="kanban-card-list">
        <SortableContext items={demands.map(d => d.id)} strategy={verticalListSortingStrategy}>
          {demands.map((demand) => (
            <SortableCard key={demand.id} demand={demand} />
          ))}
        </SortableContext>
        {demands.length === 0 && (
          <div className="kanban-empty">
            <IconDotsVertical size={16} />
            <span>No demands</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PipelineTab() {
  const [demands, setDemands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);

  const fetchDemands = useCallback(async () => {
    try {
      const res = await fetch("/api/demands");
      setDemands(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDemands(); }, [fetchDemands]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over) return;

      const activeDemand = demands.find((d) => d.id === active.id);
      if (!activeDemand) return;

      const overContainer = over.data.current?.sortable?.containerId || over.id;
      const targetStatus = Object.values(COLUMNS).find(
        (col) =>
          col.id === overContainer ||
          demands.some((d) => d.id === overContainer && d.status === col.id)
      )?.id || overContainer;

      // Find the status by checking if over.id is a column id
      let newStatus: string | null = null;
      for (const col of COLUMNS) {
        if (col.id === over.id || col.id === overContainer) {
          newStatus = col.id;
          break;
        }
      }

      // If dropped on another card, use that card's status
      if (!newStatus) {
        const overDemand = demands.find((d) => d.id === over.id);
        if (overDemand) {
          newStatus = overDemand.status;
        }
      }

      if (!newStatus || newStatus === activeDemand.status) return;

      // Optimistic update
      setDemands((prev) =>
        prev.map((d) =>
          d.id === active.id ? { ...d, status: newStatus } : d
        )
      );

      // Persist the change
      try {
        await fetch("/api/demands", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: active.id, status: newStatus }),
        });
      } catch (err) {
        console.error("Failed to update demand status:", err);
        fetchDemands(); // Revert on error
      }
    },
    [demands, fetchDemands]
  );

  const activeDemand = activeId ? demands.find((d) => d.id === activeId) : null;

  if (loading)
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "48px" }}>
        <div
          style={{
            width: "32px",
            height: "32px",
            border: "2px solid var(--color-border-tertiary)",
            borderTopColor: "var(--color-primary)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
      </div>
    );

  return (
    <div>
      <div className="page-title">Pipeline Board</div>
      <div className="page-sub">
        Drag and drop demands across stages · {demands.length} total demands
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={(event) => setHoveredColumn(event.over?.id as string || null)}
      >
        <div className="kanban-board">
          {COLUMNS.map((column) => {
            const columnDemands = demands.filter((d) => d.status === column.id);
            return (
              <Column
                key={column.id}
                column={column}
                demands={columnDemands}
                isOver={hoveredColumn === column.id}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeDemand ? (
            <div className="kanban-card" style={{ opacity: 0.9, boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: PRIORITY_COLORS[activeDemand.priority] || "#888",
                    flexShrink: 0,
                  }}
                />
                <span className="kanban-card-title">{activeDemand.title}</span>
              </div>
              <div style={{ fontSize: "10px", color: "var(--color-text-secondary)" }}>
                {activeDemand.location || "Remote"} · ${activeDemand.rateMin}-{activeDemand.rateMax}/hr
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
