import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { getBookDetails } from "@/actions/books";
import { Navbar } from "@/components/ui/navbar";
import { ChapterForm } from "@/components/chapters/chapter-form";

interface NewChapterPageProps {
  params: Promise<{ id: string }>;
}

export default async function NewChapterPage({ params }: NewChapterPageProps) {
  const { id: bookId } = await params;
  const authData = await getCurrentUser();

  if (!authData) {
    redirect(`/login?returnUrl=/book/${bookId}/chapters/new`);
  }

  const book = await getBookDetails(bookId);

  if (!book) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10">
        <ChapterForm bookId={bookId} />
      </main>
    </div>
  );
}
