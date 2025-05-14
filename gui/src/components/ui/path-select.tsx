import { useCallback, useRef, useState } from "react";
import { Button } from "./button";
import { Pencil } from "lucide-react";

// Extend HTMLInputElement to include directory selection attributes
declare module 'react' {
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    webkitdirectory?: string;
    directory?: string;
  }
}

interface PathSelectProps {
  defaultPath?: string;
  onPathChange?: (path: string) => void;
  className?: string;
}

export function PathSelect({ defaultPath = "~/pearai-projects/", onPathChange, className }: PathSelectProps) {
  const [path, setPath] = useState(defaultPath);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePathSelect = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Get the path of the first file/directory
      const selectedPath = files[0].webkitRelativePath.split('/')[0];
      const newPath = `~/${selectedPath}/`;
      setPath(newPath);
      onPathChange?.(newPath);
    }
  }, [onPathChange]);

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        webkitdirectory=""
        directory=""
        style={{ display: "none" }}
        onChange={handleFileSelect}
      />
      <Button
        variant="secondary"
        size="sm"
        className={className}
        onClick={handlePathSelect}
      >
        <Pencil className="size-4" />
        {path}
      </Button>
    </>
  );
}