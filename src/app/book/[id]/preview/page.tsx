import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { getBookDetails } from "@/actions/books";
import { getBookChaptersWithImages } from "@/actions/chapters";
import { BookReader } from "@/components/book-preview/book-reader";

interface BookPreviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookPreviewPage({ params }: BookPreviewPageProps) {
  const { id } = await params;
  const authData = await getCurrentUser();

  if (!authData) {
    redirect(`/login?returnUrl=/book/${id}/preview`);
  }

  const [book, chapters] = await Promise.all([
    getBookDetails(id),
    getBookChaptersWithImages(id),
  ]);

  if (!book) {
    notFound();
  }

  return <BookReader book={book} chapters={chapters} />;
}
