export function getCurrentUserId() {
  return (
    localStorage.getItem("promptai_user_id") ??
    import.meta.env.VITE_CURRENT_USER_ID ??
    "1"
  );
}
