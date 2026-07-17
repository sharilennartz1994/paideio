import { getCurrentCoach } from "@/lib/session";
import { parseJsonArray } from "@/lib/queries";
import { CoachProfileForm } from "@/components/coach-profile-form";
import { AvatarUpload } from "@/components/avatar-upload";

export default async function CoachProfiloPage() {
  const current = await getCurrentCoach();
  if (!current?.profile) return null;

  return (
    <div className="flex flex-col gap-6">
      <AvatarUpload name={current.user.name} currentUrl={current.profile.avatarUrl} />
      <CoachProfileForm
        initialBio={current.profile.bio}
        initialLevels={parseJsonArray(current.profile.levels)}
        initialTrainingTypes={parseJsonArray(current.profile.trainingTypes)}
        initialPricePerLesson={current.profile.pricePerLesson}
      />
    </div>
  );
}
