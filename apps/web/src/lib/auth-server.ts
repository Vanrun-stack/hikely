export { currentUser } from './api-server';

export function isAdmin(user: any) {
  return ['admin', 'super_admin'].includes(user?.role);
}

export function isModerator(user: any) {
  return ['moderator', 'admin', 'super_admin'].includes(user?.role);
}
