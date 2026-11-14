import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";

export default function DataTable({ columns, rows = [], loading, error, onRetry, emptyTitle, emptyDescription, caption = "Library records", rowKey = "id" }) {
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (!loading && !rows.length) return <EmptyState title={emptyTitle} description={emptyDescription} />;

  return (
    <div className="table-scroll">
      <table className="vault-table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col" className={column.align === "right" ? "text-right" : ""}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 5 }, (_, rowIndex) => (
              <tr key={`skeleton-${rowIndex}`} aria-hidden="true">
                {columns.map((column) => <td key={column.key}><span className="block h-3 w-3/4 animate-pulse rounded bg-[#e8e3d9]" /></td>)}
              </tr>
            ))
            : rows.map((row, index) => (
              <tr key={row[rowKey] ?? index}>
                {columns.map((column) => (
                  <td key={column.key} className={column.align === "right" ? "text-right" : ""}>
                    {column.render ? column.render(row) : row[column.key] ?? "—"}
                  </td>
                ))}
            </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
