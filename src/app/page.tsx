import { HydrateClient } from "@/trpc/server";
import PDFViewer from "@/components/pdf-viewer";

export default async function Home() {
  return (
    <HydrateClient>
      <main>
        <PDFViewer />
      </main>
    </HydrateClient>
  );
}
