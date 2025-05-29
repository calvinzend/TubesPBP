export function getProfilePicture(profilePicture?: string | null): string {
  if (!profilePicture || profilePicture === "null" || profilePicture === "") {
    return "/uploads/default-profile.png";
  }
  if (profilePicture.startsWith("http") || profilePicture.startsWith("/uploads")) {
    return profilePicture;
  }
  return `/uploads/${profilePicture}`;
}