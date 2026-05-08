export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <span className="font-semibold text-lg tracking-tight text-text-primary">
            Notion
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}
