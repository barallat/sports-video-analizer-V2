
import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export interface FileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onFileChange?: (file: File) => void
}

const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
  ({ className, onFileChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file && onFileChange) {
        onFileChange(file)
      }
    }

    return (
      <Input
        type="file"
        className={cn(
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          className
        )}
        ref={ref}
        onChange={handleChange}
        {...props}
      />
    )
  }
)
FileInput.displayName = "FileInput"

export { FileInput }
