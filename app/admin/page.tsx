import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { getAllArtworks, getSiteSettings } from "@/lib/db";
import { getRecentCommentsForAdmin } from "@/lib/feedback";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [artworks, settings, comments] = await Promise.all([
    getAllArtworks(),
    getSiteSettings(),
    getRecentCommentsForAdmin(),
  ]);

  return (
    <AdminDashboard
      artworks={artworks}
      settings={settings}
      comments={comments}
    />
  );
}
