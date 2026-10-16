import "./StatCard.css";
export default function Stat({ label, value, icon: Icon, note, onClick }) {
  const children = (
    <>
      <div className="stat-top">
        <span>{label}</span>
        <Icon size={19} />
      </div>
      <strong>{value ?? "—"}</strong>
      <small>{note}</small>
    </>
  );
  return onClick ? (
    <button
      type="button"
      className="stat stat-action"
      onClick={onClick}
      aria-label={"Ver detalhes: " + label}
    >
      {children}
    </button>
  ) : (
    <div className="stat">{children}</div>
  );
}
