/**
 * Project: What Should We Eat?
 * File: frontend/src/utils/html.js
 * Description: Escapes values inserted into HTML templates.
 * Modified by: Thanh Lan Ngo
 */

const HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => HTML_ESCAPE_MAP[character]);
}
