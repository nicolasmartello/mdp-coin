/**
 * Joins class names, skipping falsy values: cn("btn", isActive && "btn-active")
 */
export const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");
