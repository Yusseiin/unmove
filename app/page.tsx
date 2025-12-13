import { FileBrowser } from "@/components/file-browser/file-browser";
import { Toaster } from "@/components/ui/sonner";

export default function Home() {
  return (
    <div className="h-dvh max-h-dvh flex flex-col overflow-hidden">
      <header className="border-b px-4 py-3 flex items-center justify-between shrink-0 bg-background">
        <h1 className="text-lg font-semibold">File Transfer</h1>
      </header>
      <main className="flex-1 min-h-0 overflow-hidden">
        <FileBrowser />
      </main>
      <Toaster position="bottom-right" />
    </div>
  );
}
