import { Button } from "./../ui/button";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { Trash2 } from "lucide-react";
import React, { useCallback, useState, useRef } from "react";

export interface FileUploadProps {
  files: File[];
  setFiles: (files: File[]) => void;
  fileTypes?: string[];
  maxFileSize?: number;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  files,
  setFiles,
  fileTypes = ["image/*"],
  maxFileSize = 5 * 1024 * 1024, // 5MB default
  className,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previews, setPreviews] = useState<Map<string, string>>(new Map());

  const loadPreview = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviews((prev) => {
        const next = new Map(prev);
        next.set(file.name, reader.result as string);
        return next;
      });
    };
    reader.readAsDataURL(file);
  }, []);

  const validateFile = useCallback(
    (file: File) => {
      if (maxFileSize && file.size > maxFileSize) {
        console.warn(
          `File ${file.name} exceeds size limit of ${maxFileSize} bytes`,
        );
        return false;
      }

      if (fileTypes.length > 0) {
        const isValidType = fileTypes.some((type) => {
          if (type.endsWith("/*")) {
            return file.type.startsWith(type.replace("/*", "/"));
          }
          return file.type === type;
        });

        if (!isValidType) {
          console.warn(`File ${file.name} type ${file.type} not accepted`);
          return false;
        }
      }

      return true;
    },
    [maxFileSize, fileTypes],
  );

  const handleFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const validFiles = Array.from(newFiles).filter(validateFile);
      if (validFiles.length > 0) {
        validFiles.forEach(loadPreview);
        setFiles([...files, ...validFiles]);
      }
    },
    [files, setFiles, validateFile, loadPreview],
  );

  const removeFile = useCallback(
    (fileToRemove: File) => {
      setFiles(files.filter((file) => file !== fileToRemove));
      setPreviews((prev) => {
        const next = new Map(prev);
        next.delete(fileToRemove.name);
        return next;
      });
    },
    [files, setFiles],
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
        e.dataTransfer.clearData();
      }
    },
    [handleFiles],
  );

  return (
    <div className={className}>
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 w-full mb-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="relative group rounded-lg overflow-hidden"
              style={{ width: "100px", height: "100px" }}
            >
              {previews.has(file.name) && (
                <img
                  src={previews.get(file.name)}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
              )}
              <Button
                onClick={() => removeFile(file)}
                className="absolute size-8 top-1 right-1 p-1 rounded-full bg-red-500/50 text-white
                         opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/75"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={fileTypes.join(",")}
        onChange={(e) => {
          if (e.target.files) {
            handleFiles(e.target.files);
            e.target.value = ""; // Reset input
          }
        }}
        multiple
      />

      <div
        className={`relative ${
          isDragging ? "bg-blue-50 dark:bg-blue-900/20" : ""
        }`}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Button
          variant="ghost"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-lg px-4 py-1.5 min-w-[100px]"
        >
          <div className="flex items-center gap-2">
            <PhotoIcon className="h-5 w-5" />
            Upload
          </div>
        </Button>
      </div>
    </div>
  );
};
