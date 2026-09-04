// Cầu nối nhẹ giữa thẻ "Tìm kiếm nhanh" (C08, SCR-A.9.1-01) và ô tìm kiếm chức năng
// toàn cục ở Header (SCR-A.9.1-13) — tránh phải nâng state tìm kiếm lên context chung.
const EVENT = "utilities:focus-global-search"

export function requestGlobalSearchFocus() {
  window.dispatchEvent(new CustomEvent(EVENT))
}

export function onGlobalSearchFocusRequest(handler: () => void) {
  window.addEventListener(EVENT, handler)
  return () => window.removeEventListener(EVENT, handler)
}
