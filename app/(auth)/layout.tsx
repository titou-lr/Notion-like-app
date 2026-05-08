export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="text-center">
          <span className="font-semibold text-xl tracking-tight text-text-primary">
            Notion
          </span>
        </div>
        <div className="glass rounded-2xl p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
