import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" &&
          "bg-accent text-white hover:bg-accent/90",
        variant === "secondary" &&
          "border border-stone-300 bg-white text-stone-900 hover:bg-stone-50",
        variant === "ghost" &&
          "text-stone-700 hover:bg-stone-100",
        variant === "danger" &&
          "bg-red-600 text-white hover:bg-red-700",
        className,
      )}
      {...props}
    />
  );
}
