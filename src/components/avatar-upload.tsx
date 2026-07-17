"use client";

import { useRef, useState, useTransition, type ChangeEvent } from "react";
import { toast } from "sonner";
import { updateCoachAvatar } from "@/lib/actions/coach-admin";
import { CoachAvatar } from "@/components/coach-avatar";
import { Button } from "@/components/ui/button";

export function AvatarUpload({ name, currentUrl }: { name: string; currentUrl: string | null }) {
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    const formData = new FormData();
    formData.set("avatar", file);

    startTransition(async () => {
      const result = await updateCoachAvatar(formData);
      if (result.ok) {
        toast.success("Foto profilo aggiornata!");
      } else {
        setPreview(currentUrl);
        toast.error(result.error);
      }
      event.target.value = "";
    });
  }

  return (
    <div className="flex items-center gap-4">
      <CoachAvatar name={name} src={preview} className="size-16 text-xl" />
      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => inputRef.current?.click()}
        >
          {isPending ? "Caricamento…" : "Cambia foto"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
        <p className="mt-1 text-xs text-muted-foreground">JPG, PNG o WebP, max 4 MB.</p>
      </div>
    </div>
  );
}
