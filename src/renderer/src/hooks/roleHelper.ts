export function redirectRole(role: string, navigate: any) {
  switch (role) {
    case "ADMIN":
      navigate("/dashboard_user");
      return;

    case "CAISSIER":
      navigate("/pos");
      return;

    case "CHEF_RAYON":
      navigate("/dashboard_user/inventory/acc/list");
      return;

    default:
      navigate("/dashboard_user"); // fallback
      return;
  }
}
