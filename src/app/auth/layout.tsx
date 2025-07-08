import Link from "next/link";
import { Logo } from "@/components/common/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-muted/40">
        <div className="absolute top-8 left-8">
            <Link href="/">
                <Logo />
            </Link>
        </div>
      {children}
    </div>
  );
}
