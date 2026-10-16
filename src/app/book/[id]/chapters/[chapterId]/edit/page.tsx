import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { getChapterById } from "@/actions/chapters";
import { Navbar } from "@/components/ui/navbar";
import { ChapterForm } from "@/components/chapters/chapter-form";

interface EditChapterPageProps {
  params: Promise<{ id: string; chapterId: string }>;
}

export default async function EditChapterPage({ params }: EditChapterPageProps) {
  const { id: bookId, chapterId } = await params;
  const authData = await getCurrentUser();

  if (!authData) {
    redirect(`/login?returnUrl=/book/${bookId}/chapters/${chapterId}/edit`);
  }

  const chapter = await getChapterById(chapterId, bookId);

  if (!chapter) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10">
        <ChapterForm bookId={bookId} chapter={chapter} />
      </main>
    </div>
  );
}
