import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { getBookDetails } from "@/actions/books";
import { Navbar } from "@/components/ui/navbar";
import { BookSettingsForm } from "@/components/books/book-settings-form";

interface BookSettingsPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookSettingsPage({ params }: BookSettingsPageProps) {
  const { id } = await params;
  const authData = await getCurrentUser();

  if (!authData) {
    redirect(`/login?returnUrl=/book/${id}/settings`);
  }

  const book = await getBookDetails(id);

  if (!book) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10">
        <BookSettingsForm book={book} currentUserId={authData.user.id} />
      </main>
    </div>
  );
}
