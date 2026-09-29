export function csvCell(value: unknown) {
  let text =
    value == null
      ? ""
      : value instanceof Date
        ? value.toISOString()
        : String(value);
  if (/^[\s]*[=+\-@]/.test(text) || /^[\t\r\n]/.test(text)) text = "'" + text;
  return `"${text.replaceAll('"', '""')}"`;
}
export function toCsv(rows: Record<string, unknown>[]) {
  const keys = [
    "id",
    "status",
    "package_id",
    "package_name",
    "bank_status",
    "first_name",
    "last_name",
    "phone",
    "email",
    "amount_gel",
    "currency",
    "created_at",
    "paid_at",
    "bank_order_id",
    "terms_version",
  ];
  return (
    "\uFEFF" +
    [
      keys.map(csvCell).join(","),
      ...rows.map((row) => keys.map((key) => csvCell(row[key])).join(",")),
    ].join("\r\n")
  );
}
