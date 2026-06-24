import Link from "next/link";
import { LoginForm } from "@/components/admin/login-form";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-full items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-3xl text-stone-900">Admin</h1>
          <p className="mt-2 text-sm text-stone-600">
            Sign in to upload and manage artwork.
          </p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <LoginForm />
        </div>
        <p className="mt-6 text-center">
          <Link href="/" className="text-sm text-accent">
            ← Back to gallery
          </Link>
        </p>
      </div>
    </div>
  );
}
