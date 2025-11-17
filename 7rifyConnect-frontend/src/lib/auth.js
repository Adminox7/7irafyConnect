const truthyStatuses = new Set(["approved", "verified", "active", "accepted", "done", "completed"]);
const falsyStatuses = new Set(["pending", "awaiting", "waiting", "rejected", "blocked", "suspended", "disabled", "denied"]);
const truthyWords = new Set(["1", "true", "yes", "y", "t", "on", "approved", "verified", "active", "accepted"]);
const falsyWords = new Set(["0", "false", "no", "n", "f", "off", "pending", "awaiting", "waiting", "rejected", "blocked", "suspended", "disabled", "denied"]);

const coerceBoolean = (value) => {
  if (value == null) return null;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0;
  if (value instanceof Date) return !Number.isNaN(value.getTime());
  const str = String(value).trim();
  if (!str) return null;
  const normalized = str.toLowerCase();
  if (truthyWords.has(normalized)) return true;
  if (falsyWords.has(normalized)) return false;
  const numeric = Number(str);
  if (!Number.isNaN(numeric)) return numeric > 0;
  const parsedDate = Date.parse(str);
  if (!Number.isNaN(parsedDate)) return true;
  return null;
};

const hasTimestamp = (value) => {
  if (!value) return false;
  if (value instanceof Date) return !Number.isNaN(value.getTime());
  if (typeof value === "number") return value > 0;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return false;
    return !Number.isNaN(Date.parse(trimmed));
  }
  return false;
};

export const isTechnicianUser = (user) => user?.role === "technicien";

export const getUserVerificationFlag = (user) => {
  if (!user) return false;

  const statusCandidates = [
    user?.technician?.status,
    user?.technician?.state,
    user?.status,
    user?.state,
  ];

  for (const status of statusCandidates) {
    if (typeof status !== "string") continue;
    const normalized = status.trim().toLowerCase();
    if (!normalized) continue;
    if (truthyStatuses.has(normalized)) return true;
    if (falsyStatuses.has(normalized)) return false;
  }

  const timestampCandidates = [
    user?.technician?.verified_at,
    user?.technician?.approved_at,
    user?.technician?.verifiedAt,
    user?.technician?.approvedAt,
    user?.verified_at,
    user?.approved_at,
    user?.verifiedAt,
    user?.approvedAt,
  ];

  if (timestampCandidates.some(hasTimestamp)) {
    return true;
  }

  const booleanCandidates = [
    user?.technician?.isVerified,
    user?.technician?.is_verified,
    user?.technician?.verified,
    user?.technician?.isApproved,
    user?.technician?.is_approved,
    user?.technician?.approved,
    user?.technician?.is_active,
    user?.technician?.active,
    user?.isVerified,
    user?.is_verified,
    user?.verified,
    user?.isApproved,
    user?.is_approved,
    user?.approved,
    user?.is_active,
    user?.active,
  ];

  for (const candidate of booleanCandidates) {
    const coerced = coerceBoolean(candidate);
    if (coerced != null) {
      return coerced;
    }
  }

  return false;
};

export const isVerifiedTechnician = (user) =>
  isTechnicianUser(user) && getUserVerificationFlag(user);
