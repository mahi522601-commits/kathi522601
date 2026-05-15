export const ADMIN_EMAILS = [
  'admin@khyathi.com',
  'kathifashions.store@gmail.com',
  'velchurimahesh77@gmail.com',
];

export function isAdminEmail(email = '') {
  return ADMIN_EMAILS.includes(String(email).toLowerCase());
}
