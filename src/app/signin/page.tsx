import { permanentRedirect } from "next/navigation";

export default function SigninPage() {
  permanentRedirect("/auth/sign-in");
}
