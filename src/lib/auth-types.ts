export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin" | "ops" | "delivery";
};
