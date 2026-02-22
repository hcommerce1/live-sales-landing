/**
 * Shared auth helpers for analytics API endpoints.
 */

export function getAdminToken(): string {
  return (
    (typeof import.meta !== 'undefined' && import.meta.env?.ANALYTICS_ADMIN_TOKEN) ||
    process.env.ANALYTICS_ADMIN_TOKEN ||
    ''
  );
}

export function isAuthenticated(request: Request): boolean {
  const cookies = request.headers.get('cookie') || '';
  const match = cookies.match(/ls_admin_token=([^;]+)/);
  const token = match?.[1];
  const adminToken = getAdminToken();
  return !!(token && adminToken && token === adminToken);
}
