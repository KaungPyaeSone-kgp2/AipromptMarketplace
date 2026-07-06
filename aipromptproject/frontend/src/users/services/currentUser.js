export function getCurrentUserId() {
  return (
    sessionStorage.getItem("promptai_user_id") ??
    import.meta.env.VITE_CURRENT_USER_ID ??
    null
  );
}
