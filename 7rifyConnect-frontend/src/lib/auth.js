export const isTechnicianUser = (user) => user?.role === "technicien";

export const getUserVerificationFlag = (user) =>
  user?.technician?.isVerified ??
  user?.technician?.is_verified ??
  user?.isVerified ??
  user?.is_verified ??
  false;

export const isVerifiedTechnician = (user) =>
  isTechnicianUser(user) && getUserVerificationFlag(user);
