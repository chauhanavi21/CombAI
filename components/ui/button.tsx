import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium tracking-wide transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-50 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-ink-900 text-ink-50 hover:bg-ink-800 hover:scale-[1.02] shadow-sm",
        secondary:
          "border border-ink-300 bg-transparent text-ink-900 hover:bg-ink-100 hover:border-ink-400",
        gold: "bg-gradient-to-b from-gold-500 to-gold-600 text-ink-900 font-semibold shadow-lg shadow-gold-500/20 hover:shadow-xl hover:shadow-gold-500/30 hover:scale-[1.02]",
        ghost: "text-ink-700 hover:text-ink-900 hover:bg-ink-100",
        link: "text-ink-700 underline-offset-4 hover:text-ink-900 hover:underline rounded-none",
        outline:
          "border border-ink-900 bg-transparent text-ink-900 hover:bg-ink-900 hover:text-ink-50",
      },
      size: {
        sm: "px-4 py-2 text-xs",
        md: "px-6 py-3 text-sm",
        lg: "px-8 py-4 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
