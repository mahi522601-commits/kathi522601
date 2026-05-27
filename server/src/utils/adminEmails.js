const DEFAULT_ADMIN_EMAILS = [
  'admin@khyathi.com',
  'kathifashions.store@gmail.com',
  'velchurimahesh77@gmail.com',
];

function parseConfiguredAdminEmails() {
  const configured = process.env.ADMIN_EMAILS || '';

  if (!configured.trim()) {
    return DEFAULT_ADMIN_EMAILS;
  }

  const merged = new Set(DEFAULT_ADMIN_EMAILS);

  configured
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
    .forEach((email) => merged.add(email));

  return [...merged];
}

const adminEmails = parseConfiguredAdminEmails();

export function isAdminEmail(email = '') {
  return adminEmails.includes(String(email).toLowerCase());
}

export { adminEmails };
