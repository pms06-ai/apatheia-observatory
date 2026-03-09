export function getMetaContent(name) {
  return document.querySelector(`meta[name="${name}"]`)?.content?.trim() || "";
}

export function asArray(value) {
  return Array.isArray(value) ? value : [];
}
