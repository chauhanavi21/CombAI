import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <p className="label-eyebrow mb-4">Welcome back</p>
          <h1 className="font-display text-4xl tracking-tight text-ink-900">
            Sign in to <span className="italic font-light">Luxe</span>
          </h1>
        </div>
        <div className="flex justify-center">
          <SignIn
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none bg-transparent border border-ink-200 rounded-3xl",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
