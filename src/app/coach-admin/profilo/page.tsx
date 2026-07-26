import { getCurrentCoach } from "@/lib/session";
import { parseJsonArray } from "@/lib/queries";
import { CoachProfileForm } from "@/components/coach-profile-form";
import { AvatarUpload } from "@/components/avatar-upload";

export default async function CoachProfiloPage() {
  const current = await getCurrentCoach();
  if (!current?.profile) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="h-fit border border-game-cyan/30 bg-game-cyan/7 p-5">
        <p className="font-heading text-lg text-calce">La tua scheda giocatore</p>
        <p className="mt-2 text-sm leading-relaxed text-nebbia">Foto, proposta e prezzo sono le informazioni che aiutano un giocatore a capire se sei il coach giusto.</p>
      </aside>
      <div className="card-clip flex flex-col gap-6 border border-outline-variant/20 bg-surface-container p-6 shadow-2xl">
      <AvatarUpload name={current.user.name} currentUrl={current.profile.avatarUrl} />
      <CoachProfileForm
        initialBio={current.profile.bio}
        initialLevels={parseJsonArray(current.profile.levels)}
        initialTrainingTypes={parseJsonArray(current.profile.trainingTypes)}
        initialPricePerLesson={current.profile.pricePerLesson}
      />
      </div>
    </div>
  );
}
