import { ListeningHub } from "@/components/features/listening/ListeningHub";
import { fetchListeningMaterials } from "@/actions/listening.actions";
import { ListeningMaterial } from "@/types/listening.types";

export const metadata = {
  title: "Listening | TOEFL iBT App",
  description: "Practice the new TOEFL 2026 Listening section",
};

export default async function ListeningPage() {
  const { success, data } = await fetchListeningMaterials();
  const materials: ListeningMaterial[] = success && data ? data : [];

  return (
    <div className="min-h-screen bg-[#fdfdfc] dark:bg-[#0a0c10] pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <ListeningHub initialMaterials={materials} />
    </div>
  );
}
