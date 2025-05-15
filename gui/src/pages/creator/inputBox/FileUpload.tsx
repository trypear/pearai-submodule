import { Button } from "./../ui/button";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { Trash2 } from "lucide-react";
import React, { useCallback, useState, useEffect, useMemo } from "react";

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
  const [processingFiles, setProcessingFiles] = useState<Set<string>>(
    new Set(),
  );

  // Process files and generate previews
  useEffect(() => {
    const processFile = async (file: File) => {
      if (!file.type.startsWith("image/")) return;

      setProcessingFiles((prev) => new Set([...prev, file.name]));

      try {
        // Create a preview URL
        const previewUrl = URL.createObjectURL(file);

        // Update previews state
        setPreviews((prev) => {
          const next = new Map(prev);
          next.set(file.name, previewUrl);
          return next;
        });

        // Create an image element to ensure it loads
        await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = reject;
          img.src = previewUrl;
        });

        // Mark as loaded
        setLoadedImages((prev) => new Set([...prev, file.name]));
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
      } finally {
        setProcessingFiles((prev) => {
          const next = new Set(prev);
          next.delete(file.name);
          return next;
        });
      }
    };

    // Process any files that don't have previews yet
    files.forEach((file) => {
      if (!previews.has(file.name) && !processingFiles.has(file.name)) {
        processFile(file);
      }
    });

    // Cleanup function to revoke unused URLs
    return () => {
      const currentFileNames = new Set(files.map((f) => f.name));
      previews.forEach((url, fileName) => {
        if (!currentFileNames.has(fileName) && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
          setPreviews((prev) => {
            const next = new Map(prev);
            next.delete(fileName);
            return next;
          });
        }
      });
    };
  }, [files]);

  // Memoized preview loading state
  const previewStates = useMemo(() => {
    return files.map((file) => ({
      file,
      preview: previews.get(file.name),
      isLoading: processingFiles.has(file.name),
      isLoaded: loadedImages.has(file.name),
    }));
  }, [files, previews, processingFiles, loadedImages]);

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
        // Generate unique names for pasted files that don't have names
        const processedFiles = validFiles.map((file) => {
          if (file.name === "image.png" || !file.name) {
            const timestamp = new Date().getTime();
            const extension = file.type.split("/")[1] || "png";
            return new File([file], `pasted-image-${timestamp}.${extension}`, {
              type: file.type,
            });
          }
          return file;
        });

        // Update files state - preview generation will be handled by useEffect
        setFiles([...files, ...processedFiles]);
      }
    },
    [files, validateFile],
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

  const removeFile = useCallback(
    (fileToRemove: File) => {
      setFiles(files.filter((file) => file !== fileToRemove));
      setPreviews((prev) => {
        const next = new Map(prev);
        // Revoke the object URL if it exists
        const preview = prev.get(fileToRemove.name);
        if (preview?.startsWith("blob:")) {
          URL.revokeObjectURL(preview);
        }
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
    <div className={`${className}`}>
      <div className="flex flex-wrap gap-2 w-full mb-2">
        {previewStates.map(({ file, preview, isLoading, isLoaded }, index) => (
          <div
            key={`${file.name}-${index}`}
            className="relative group rounded-lg overflow-hidden"
            style={{ width: "100px", height: "100px" }}
          >
            {preview ? (
              <>
                <img
                  src={preview}
                  alt={file.name}
                  className="w-full h-full object-cover transition-opacity duration-300"
                  style={{ opacity: isLoaded ? 1 : 0 }}
                />
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50 dark:bg-gray-800/50">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                  </div>
                )}
              </>
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
