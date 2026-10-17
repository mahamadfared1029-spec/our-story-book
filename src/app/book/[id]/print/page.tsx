import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { getBookDetails } from "@/actions/books";
import { getBookChaptersWithImages } from "@/actions/chapters";
import { PrintableBook } from "@/components/print/printable-book";

interface PrintPageProps {
  params: Promise<{ id: string }>;
}

export default async function PrintPage({ params }: PrintPageProps) {
  const { id } = await params;
  const authData = await getCurrentUser();

  if (!authData) {
    redirect(`/login?returnUrl=/book/${id}/print`);
  }

  const [book, chapters] = await Promise.all([
    getBookDetails(id),
    getBookChaptersWithImages(id),
  ]);

  if (!book) {
    notFound();
  }

  return <PrintableBook book={book} chapters={chapters} />;
}
