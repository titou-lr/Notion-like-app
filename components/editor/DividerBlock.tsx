interface DividerBlockProps {
  onEnter: () => void;
}

export function DividerBlock({ onEnter }: DividerBlockProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onEnter();
    }
  };

  return (
    <div tabIndex={0} onKeyDown={handleKeyDown} className="py-1 outline-none">
      <hr className="border-border" />
    </div>
  );
}
