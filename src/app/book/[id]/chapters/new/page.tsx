import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { getBookDetails } from "@/actions/books";
import { Navbar } from "@/components/ui/navbar";
import { ChapterForm } from "@/components/chapters/chapter-form";

interface NewChapterPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function NewChapterPage({
  params,
  searchParams,
}: NewChapterPageProps) {
  const { id: bookId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const authData = await getCurrentUser();

  if (!authData) {
    redirect(`/login?returnUrl=/book/${bookId}/chapters/new`);
  }

  const book = await getBookDetails(bookId);

  if (!book) {
    notFound();
  }

  const initialValues = {
    title: typeof resolvedSearchParams.title === "string" ? resolvedSearchParams.title : undefined,
    isMilestone: resolvedSearchParams.isMilestone === "true",
    milestoneType: typeof resolvedSearchParams.milestoneType === "string" ? resolvedSearchParams.milestoneType : undefined,
    mood: typeof resolvedSearchParams.mood === "string" ? resolvedSearchParams.mood : undefined,
    bodyPlaceholder: typeof resolvedSearchParams.placeholder === "string" ? resolvedSearchParams.placeholder : undefined,
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10">
        <ChapterForm bookId={bookId} initialValues={initialValues} />
      </main>
    </div>
  );
}
