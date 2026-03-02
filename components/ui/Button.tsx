import { Button as RadixButton } from "@radix-ui/themes"
import type { ComponentPropsWithoutRef } from "react"

type RadixButtonProps = ComponentPropsWithoutRef<typeof RadixButton>

interface ButtonProps extends Omit<RadixButtonProps, "variant" | "size" | "color"> {
  variant?: "primary" | "secondary" | "danger"
  size?: "sm" | "md" | "lg"
}

export default function Button({
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonProps) {
  const radixVariant: RadixButtonProps["variant"] =
    variant === "secondary" ? "outline" : "solid"
  const radixColor: RadixButtonProps["color"] =
    variant === "danger" ? "red" : variant === "secondary" ? "gray" : "indigo"
  const radixSize: RadixButtonProps["size"] =
    size === "sm" ? "1" : size === "lg" ? "3" : "2"

  return (
    <RadixButton variant={radixVariant} color={radixColor} size={radixSize} {...props}>
      {children}
    </RadixButton>
  )
}
