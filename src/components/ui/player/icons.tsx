type IconProps = { size?: number; className?: string };

export function IcoPlay({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="currentColor" d="M6.2 2.4v19.2L21.6 12 6.2 2.4z" />
    </svg>
  );
}

export function IcoPause({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="currentColor" d="M5 3h5.2v18H5V3zm8.8 0H19v18h-5.2V3z" />
    </svg>
  );
}

export function IcoSkipTen({
  dir,
  size = 28,
  className,
}: IconProps & { dir: "back" | "fwd" }) {
  return (
    <svg width={size} height={Math.round(size * 0.72)} viewBox="0 0 34 24" className={className} aria-hidden>
      {dir === "back" ? (
        <>
          <path fill="currentColor" d="M13.4 3.4v17.2L1.4 12 13.4 3.4z" />
          <rect fill="currentColor" x="14.8" y="3.4" width="2.3" height="17.2" />
        </>
      ) : (
        <>
          <rect fill="currentColor" x="16.8" y="3.4" width="2.3" height="17.2" />
          <path fill="currentColor" d="M20.6 3.4v17.2L32.6 12 20.6 3.4z" />
        </>
      )}
    </svg>
  );
}

export function IcoVolume({ size = 18, className, muted }: IconProps & { muted?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="currentColor" d="M2.8 8.2H7.4L13 3.6v16.8L7.4 15.8H2.8V8.2z" />
      {muted ? (
        <path fill="none" stroke="currentColor" strokeWidth="1.8" d="M15.4 8.2l6.4 7.6M21.8 8.2l-6.4 7.6" />
      ) : (
        <>
          <path fill="none" stroke="currentColor" strokeWidth="1.6" d="M15.6 9.1c1.35 1.2 1.35 4.6 0 5.8" />
          <path fill="none" stroke="currentColor" strokeWidth="1.6" d="M18.5 6.8c2.5 2.3 2.5 8.1 0 10.4" />
        </>
      )}
    </svg>
  );
}

export function IcoExpand({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="currentColor" d="M3 3h7.2v2.2H5.2V10H3V3zm10.8 0H21v7h-2.2V5.2H13.8V3zM3 14h2.2v4.8H10V21H3v-7zm13.8 4.8V14H21v7h-7v-2.2h4.8z" />
    </svg>
  );
}

export function IcoCompress({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="currentColor" d="M9.4 9.4H3V7.2h4.2V3h2.2v6.4zM21 9.4h-6.4V3h2.2v4.2H21v2.2zM9.4 21h-2.2v-4.2H3v-2.2h6.4V21zM21 14.6v2.2h-4.2V21h-2.2v-6.4H21z" />
    </svg>
  );
}

export function IcoLoop({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="none" stroke="currentColor" strokeWidth="1.8" d="M8 7.2h9.4l-2.6-2.6" />
      <path fill="none" stroke="currentColor" strokeWidth="1.8" d="M16 16.8H6.6l2.6 2.6" />
      <path fill="none" stroke="currentColor" strokeWidth="1.8" d="M17.4 7.2v4.2M6.6 16.8v-4.2" />
    </svg>
  );
}

export function IcoPip({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="none" stroke="currentColor" strokeWidth="1.8" d="M3 5h18v14H3z" />
      <path fill="currentColor" d="M12.2 11.4H20V18h-7.8v-6.6z" />
    </svg>
  );
}

export function IcoOut({ size = 12, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="none" stroke="currentColor" strokeWidth="1.8" d="M4 10V4h16v16h-6" />
      <path fill="currentColor" d="M11 13.2h9.4v2H11z" />
      <path fill="currentColor" d="M16.4 7.4l5.8 5.6-5.8 5.6v-3.8H9.4v-3.6h7V7.4z" />
    </svg>
  );
}

export function IcoSkipAd({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="currentColor" d="M2.8 4.2v15.6L14 12 2.8 4.2z" />
      <path fill="currentColor" d="M14.8 4.2v15.6L21.6 12 14.8 4.2z" />
    </svg>
  );
}
