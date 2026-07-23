export function interpolate(template: string, values?: Record<string, string | number>) {
  if (!values) return template

  return template.replace(/\{(\w+)\}/g, (_match, key: string) => {
    const v = values[key]
    return v === undefined || v === null ? `{${key}}` : String(v)
  })
}
