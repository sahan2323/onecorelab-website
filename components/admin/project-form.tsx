"use client";
import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { slugify } from "@/lib/utils";
import { PROJECT_CATEGORIES } from "@/models";
import type { ProjectActionState } from "@/app/admin/(dashboard)/projects/actions";
import type { ProjectWithRelations } from "@/models";

type Action = (prev: ProjectActionState, formData: FormData) => Promise<ProjectActionState>;

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Saving…
        </>
      ) : (
        label
      )}
    </Button>
  );
}

export function ProjectForm({
  action,
  project,
  canPublish,
}: {
  action: Action;
  project?: ProjectWithRelations;
  canPublish: boolean;
}) {
  const [state, formAction] = useFormState<ProjectActionState, FormData>(action, { status: "idle" });
  const [slugTouched, setSlugTouched] = React.useState(Boolean(project));
  const [title, setTitle] = React.useState(project?.title ?? "");
  const [slug, setSlug] = React.useState(project?.slug ?? "");
  const { toast } = useToast();
  const router = useRouter();
  const error = (field: string) => state.fieldErrors?.[field];

  React.useEffect(() => {
    if (state.status === "idle" && project) {
      // A successful update returns {status:'idle'} without redirecting.
      toast({ title: "Project saved", variant: "success" });
      router.refresh();
    }
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form action={formAction} className="space-y-8">
      <section className="grid gap-5 rounded-2xl border border-border bg-card p-6 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="title">Project Name</Label>
          <Input
            id="title"
            name="title"
            required
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
          />
          {error("title") && <p className="text-xs text-destructive">{error("title")}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            name="slug"
            required
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
          />
          {error("slug") && <p className="text-xs text-destructive">{error("slug")}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="client">Client</Label>
          <Input id="client" name="client" defaultValue={project?.client ?? ""} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="category">Category</Label>
          <Select id="category" name="category" defaultValue={project?.category ?? PROJECT_CATEGORIES[0]} required>
            {PROJECT_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="year">Year</Label>
          <Input id="year" name="year" type="number" defaultValue={project?.year ?? new Date().getFullYear()} required />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="shortDescription">Short Description</Label>
          <Textarea id="shortDescription" name="shortDescription" rows={2} defaultValue={project?.shortDescription} required />
          {error("shortDescription") && <p className="text-xs text-destructive">{error("shortDescription")}</p>}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="fullDescription">Full Description</Label>
          <Textarea id="fullDescription" name="fullDescription" rows={6} defaultValue={project?.fullDescription} required />
        </div>
      </section>

      <section className="grid gap-5 rounded-2xl border border-border bg-card p-6 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="coverImage">Cover Image URL</Label>
          <Input id="coverImage" name="coverImage" defaultValue={project?.coverImage} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="projectUrl">Live Project URL</Label>
          <Input id="projectUrl" name="projectUrl" defaultValue={project?.projectUrl ?? ""} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="images">Additional Gallery Images</Label>
          <Textarea
            id="images"
            name="images"
            rows={3}
            placeholder="One image URL per line"
            defaultValue={project?.images.filter((i) => i.url !== project.coverImage).map((i) => i.url).join("\n")}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="technologies">Technologies</Label>
          <Textarea
            id="technologies"
            name="technologies"
            rows={2}
            placeholder="One per line, or comma-separated"
            defaultValue={project?.technologies.map((t) => t.name).join("\n")}
          />
        </div>
      </section>

      <section className="flex flex-wrap items-center gap-8 rounded-2xl border border-border bg-card p-6">
        <div className="space-y-1.5">
          <Label htmlFor="displayOrder">Display Order</Label>
          <Input id="displayOrder" name="displayOrder" type="number" defaultValue={project?.displayOrder ?? 0} className="w-28" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox name="featured" defaultChecked={project?.featured} />
          Featured on homepage
        </label>
        <label className={`flex items-center gap-2 text-sm ${!canPublish ? "opacity-50" : ""}`}>
          <Checkbox name="published" defaultChecked={project?.published} disabled={!canPublish} />
          Published (visible on the public site)
        </label>
        {!canPublish && <p className="text-xs text-muted-foreground">Only Admins and above can publish projects.</p>}
      </section>

      {state.status === "error" && state.message && (
        <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{state.message}</p>
      )}

      <SubmitButton label={project ? "Save Changes" : "Create Project"} />
    </form>
  );
}
