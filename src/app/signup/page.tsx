import { permanentRedirect } from "next/navigation";

export default function SignupPage() {
  permanentRedirect("/auth/sign-up");
}
