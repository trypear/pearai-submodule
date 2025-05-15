import { Button } from "./../ui/button";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { Trash2 } from "lucide-react";
import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";

export interface FileUploadProps {
  files: File[];
  setFiles: (files: File[]) => void;
  fileTypes?: string[];
  maxFileSize?: number;
  className?: string;
  setFileUploadCallback?: React.Dispatch<React.SetStateAction<() => void>>;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  files,
  setFiles,
  fileTypes = ["image/*"],
  maxFileSize = 5 * 1024 * 1024, // 5MB default
  className,
  setFileUploadCallback,
}) => {
  const [previews, setPreviews] = useState<Map<string, string>>(new Map());
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const loadPreview = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;

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

  // Set up the file upload callback
  useEffect(() => {
    setFileUploadCallback(() => {
      return () => {
        const input = document.createElement("input");
        input.type = "file";
        input.multiple = true;
        input.accept = fileTypes.join(",");
        input.onchange = (e) => {
          const files = (e.target as HTMLInputElement).files;
          if (files) {
            handleFiles(files);
          }
        };
        input.click();
      };
    });
  }, [setFileUploadCallback, fileTypes, handleFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFiles,
    accept: fileTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize: maxFileSize,
  });

  const removeFile = useCallback(
    (fileToRemove: File) => {
      setFiles(files.filter((file) => file !== fileToRemove));
      setPreviews((prev) => {
        const next = new Map(prev);
        next.delete(fileToRemove.name);
        return next;
      });
      setLoadedImages((prev) => {
        const next = new Set(prev);
        next.delete(fileToRemove.name);
        return next;
      });
    },
    [files, setFiles],
  );

  if (!files.length) return null;

  return (
    <div
      className={`${className} relative ${
        isDragActive
          ? "bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-500"
          : ""
      }`}
      {...getRootProps()}
    >
      <input {...getInputProps()} />

      {isDragActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-50/50 dark:bg-blue-900/20 z-10">
          <p className="text-blue-600 dark:text-blue-400">Drop files here...</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2 w-full mb-2">
        {files.map((file, index) => (
          <div
            key={`${file.name}-${index}`}
            className="relative group rounded-lg overflow-hidden"
            style={{ width: "100px", height: "100px" }}
          >
            {previews.has(file.name) ? (
              <img
                src={previews.get(file.name)}
                alt={file.name}
                className="w-full h-full object-cover transition-opacity duration-300"
                style={{ opacity: loadedImages.has(file.name) ? 1 : 0 }}
                onLoad={() => {
                  setLoadedImages((prev) => {
                    const next = new Set(prev);
                    next.add(file.name);
                    return next;
                  });
                }}
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 transition-opacity duration-300"
                style={{ opacity: 1 }}
              >
                <span className="text-sm text-gray-500 dark:text-gray-400 text-center px-2 break-words">
                  {file.name}
                </span>
              </div>
            )}
            <Button
              onClick={(e) => {
                e.stopPropagation();
                removeFile(file);
              }}
              className="absolute size-8 top-1 right-1 p-1 rounded-full bg-red-500/50 text-white
                       opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/75"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
