import * as React from "react";
import { useState } from "react";
import Papa from "papaparse";
import { Upload } from "lucide-react";
import { Button } from "./Button";
import { toast } from "sonner";

interface BulkImportProps {
  onImport: (data: any[]) => Promise<void>;
  title?: string;
}

export function BulkImport({ onImport, title = "Bulk Import" }: BulkImportProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results: any) => {
        setIsUploading(true);
        try {
          await onImport(results.data);
          toast.success("Import successful");
        } catch {
          // handled upstream
        } finally {
          setIsUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      },
      error: (error: any) => {
        toast.error(`Failed to parse CSV: ${error.message}`);
      },
    });
  };

  return (
    <>
      <input
        type="file"
        accept=".csv"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <Button
        variant="white"
        onClick={() => fileInputRef.current?.click()}
        isLoading={isUploading}
        className="w-full sm:w-auto"
      >
        <Upload className="h-4 w-4" />
        {title}
      </Button>
    </>
  );
}
