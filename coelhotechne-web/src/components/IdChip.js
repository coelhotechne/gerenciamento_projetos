export default function IdChip({ children, redacted = false }) {
  return <span className={`id-chip${redacted ? " is-redacted" : ""}`}>{children}</span>;
}
