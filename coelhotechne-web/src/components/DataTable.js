import { Inbox } from "lucide-react";

export default function DataTable({ columns, rows, onRowClick, isLoading, emptyTitle = "Nada por aqui", emptyMessage = "Nenhum registro encontrado." }) {
  if (!isLoading && rows.length === 0) {
    return (
      <div className="empty-state">
        <Inbox size={26} color="var(--text-tertiary)" />
        <h3>{emptyTitle}</h3>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={{ width: col.width }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      <span
                        style={{
                          display: "inline-block",
                          height: 12,
                          width: "70%",
                          borderRadius: 4,
                          background: "var(--surface-hover)",
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            : rows.map((row) => (
                <tr key={row.id} className={onRowClick ? "is-clickable" : ""} onClick={() => onRowClick?.(row)}>
                  {columns.map((col) => (
                    <td key={col.key} className={col.muted ? "cell-muted" : ""}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}
