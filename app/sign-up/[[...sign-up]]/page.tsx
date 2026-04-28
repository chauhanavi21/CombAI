import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <p className="label-eyebrow mb-4">Get started</p>
          <h1 className="font-display text-4xl tracking-tight text-ink-900">
            Join <span className="italic font-light">Luxe</span>
          </h1>
          <p className="mt-3 text-ink-600">
            Create an account to access your purchases.
          </p>
        </div>
        <div className="flex justify-center">
          <SignUp
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
