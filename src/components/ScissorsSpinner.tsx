const ScissorsSpinner = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin"
      style={{ animationDuration: "1.5s" }}
    >
      <circle cx="6" cy="18" r="2.5" stroke="hsl(42, 58%, 54%)" strokeWidth="1.5" fill="none" />
      <line x1="7.5" y1="16.5" x2="16" y2="4" stroke="hsl(42, 58%, 54%)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="18" cy="18" r="2.5" stroke="hsl(42, 58%, 54%)" strokeWidth="1.5" fill="none" />
      <line x1="16.5" y1="16.5" x2="8" y2="4" stroke="hsl(42, 58%, 54%)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  </div>
);

export default ScissorsSpinner;
