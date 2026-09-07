"use client";
import Link from "next/link";
import { Pencil, Trash2, Star, Eye, EyeOff } from "lucide-react";
import { AdminTable, type AdminTableColumn } from "@/components/admin/data-table";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import type { ProjectWithRelations } from "@/models";
import { deleteProjectAction, togglePublishedAction, toggleFeaturedAction } from "./actions";

export function ProjectsTable({
  projects,
  canPublish,
}: {
  projects: ProjectWithRelations[];
  canPublish: boolean;
}) {
  const { toast } = useToast();

  const columns: AdminTableColumn<ProjectWithRelations>[] = [
    {
      key: "title",
      header: "Project",
      render: (p) => (
        <div>
          <p className="font-medium">{p.title}</p>
          <p className="text-xs text-muted-foreground">{p.category} — {p.year}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (p) => (
        <div className="flex items-center gap-2">
          <Badge variant={p.published ? "success" : "outline"}>{p.published ? "Published" : "Draft"}</Badge>
          {p.featured && <Badge variant="royal">Featured</Badge>}
        </div>
      ),
    },
    {
      key: "order",
      header: "Order",
      render: (p) => <span className="text-sm text-muted-foreground">{p.displayOrder}</span>,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (p) => (
        <div className="flex justify-end gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            title={p.featured ? "Unfeature" : "Feature"}
            onClick={async () => {
              await toggleFeaturedAction(p.id, !p.featured);
              toast({ title: p.featured ? "Removed from featured" : "Marked as featured", variant: "success" });
            }}
          >
            <Star className={`h-4 w-4 ${p.featured ? "fill-royal-600 text-royal-600" : ""}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title={p.published ? "Unpublish" : "Publish"}
            disabled={!canPublish}
            onClick={async () => {
              await togglePublishedAction(p.id, !p.published);
              toast({ title: p.published ? "Unpublished" : "Published", variant: "success" });
            }}
          >
            {p.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" asChild title="Edit">
            <Link href={`/admin/projects/${p.id}`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <ConfirmDialog
            trigger={
              <Button variant="ghost" size="icon" title="Delete">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            }
            title={`Delete "${p.title}"?`}
            description="This permanently removes the project, its images, and its technology tags. This can't be undone."
            onConfirm={async () => {
              await deleteProjectAction(p.id);
              toast({ title: "Project deleted", variant: "success" });
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <AdminTable
      rows={projects}
      columns={columns}
      searchPlaceholder="Search projects…"
      searchFn={(p, q) => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)}
      emptyMessage="No projects yet — create your first one."
    />
  );
}
