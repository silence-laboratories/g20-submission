'use client';

import { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Upload, FileSpreadsheet, X, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { IconExclamationMark } from '@tabler/icons-react';
import LoanSubmitDialog from './loan-submit-dialog';

interface UploadedFile {
    id: string;
    file: File;
    status: 'pending' | 'uploading' | 'success' | 'error';
    progress: number;
    errorMessage?: string;
}

interface ApplyLoanUploadProps {
    onBack?: () => void;
    onNext?: () => void;
    onFilesChange?: (files: File[]) => void;
}

const ACCEPTED_FILE_TYPES = {
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'text/csv': ['.csv'],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function ApplyLoanUpload({
    onBack,
    onNext,
    onFilesChange
}: ApplyLoanUploadProps) {
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateFile = (file: File): string | null => {
        // Check file type
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        const validExtensions = Object.values(ACCEPTED_FILE_TYPES).flat();

        if (!validExtensions.includes(fileExtension)) {
            return `Invalid file type. Please upload Excel (.xls, .xlsx) or CSV (.csv) files only.`;
        }

        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            return `File size exceeds 10MB limit. Please upload a smaller file.`;
        }

        // Check if file already exists
        const fileExists = uploadedFiles.some(
            (uploadedFile) => uploadedFile.file.name === file.name && uploadedFile.file.size === file.size
        );

        if (fileExists) {
            return `File "${file.name}" has already been uploaded.`;
        }

        return null;
    };

    const simulateUpload = (fileId: string) => {
        // Simulate file upload progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;

            setUploadedFiles((prev) =>
                prev.map((f) =>
                    f.id === fileId
                        ? { ...f, progress, status: progress === 100 ? 'success' : 'uploading' }
                        : f
                )
            );

            if (progress >= 100) {
                clearInterval(interval);
            }
        }, 200);
    };

    const handleFiles = useCallback((files: FileList | null) => {
        if (!files || files.length === 0) return;

        setError(null);
        const newFiles: UploadedFile[] = [];

        Array.from(files).forEach((file) => {
            const validationError = validateFile(file);

            if (validationError) {
                setError(validationError);
                return;
            }

            const fileId = `${file.name}-${Date.now()}-${Math.random()}`;
            newFiles.push({
                id: fileId,
                file,
                status: 'pending',
                progress: 0,
            });
        });

        if (newFiles.length > 0) {
            setUploadedFiles((prev) => [...prev, ...newFiles]);

            // Simulate upload for each file
            newFiles.forEach((uploadedFile) => {
                setTimeout(() => simulateUpload(uploadedFile.id), 100);
            });

            // Notify parent component of file changes
            if (onFilesChange) {
                const allFiles = [...uploadedFiles, ...newFiles].map(f => f.file);
                onFilesChange(allFiles);
            }
        }
    }, [uploadedFiles, onFilesChange]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    }, [handleFiles]);

    const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files);
        // Reset input value to allow uploading the same file again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [handleFiles]);

    const removeFile = (fileId: string) => {
        setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));

        // Update parent component
        if (onFilesChange) {
            const remainingFiles = uploadedFiles
                .filter((f) => f.id !== fileId)
                .map(f => f.file);
            onFilesChange(remainingFiles);
        }
    };

    const handleBrowseClick = () => {
        fileInputRef.current?.click();
    };

    const getFileIcon = (fileName: string) => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        if (extension === 'csv') {
            return <FileText className="h-8 w-8 text-green-500" />;
        }
        return <FileSpreadsheet className="h-8 w-8 text-blue-500" />;
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const canProceed = uploadedFiles.length > 0 && uploadedFiles.every(f => f.status === 'success');

    return (
        <div className="max-w-5xl p-6 space-y-8">
            <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">Data upload</h1>
                <p className="text-sm text-muted-foreground">
                    Upload your financial statements for loan application
                </p>
            </div>

            <Card className="bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800">
                <CardContent>
                    <div>
                        <div className="flex-1">
                            <div className="space-y-3">
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center mt-0.5">
                                        <IconExclamationMark className="w-3 h-3 text-green-600 dark:text-green-400" />
                                    </div>
                                    <p className="text-sm text-green-800 dark:text-green-200">Your uploaded data will not leave your device and will be encrypted on your device</p>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center mt-0.5">
                                        <IconExclamationMark className="w-3 h-3 text-green-600 dark:text-green-400" />
                                    </div>
                                    <p className="text-sm text-green-800 dark:text-green-200">Your uploaded data will be used for loan application and will not be shared with any third party</p>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center mt-0.5">
                                        <IconExclamationMark className="w-3 h-3 text-green-600 dark:text-green-400" />
                                    </div>
                                    <p className="text-sm text-green-800 dark:text-green-200">By uploading these financial statements, you&apos;re self-declaring that the data is accurate and complete</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="space-y-6">
                    <p className="text-sm text-muted-foreground">
                        Accepted formats: Excel (.xls, .xlsx) and CSV (.csv) files up to 10MB
                    </p>
                    {/* Error Alert */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Drag and Drop Area */}
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={cn(
                            'border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer',
                            isDragging
                                ? 'border-primary bg-primary/5 scale-[1.02]'
                                : 'border-border hover:border-primary/50 hover:bg-accent/5'
                        )}
                        onClick={handleBrowseClick}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept=".xls,.xlsx,.csv"
                            onChange={handleFileInputChange}
                            className="hidden"
                        />

                        <div className="flex flex-col items-center space-y-4">
                            <div className={cn(
                                'p-4 rounded-full transition-colors',
                                isDragging ? 'bg-primary/10' : 'bg-accent'
                            )}>
                                <Upload className={cn(
                                    'h-10 w-10 transition-colors',
                                    isDragging ? 'text-primary' : 'text-muted-foreground'
                                )} />
                            </div>

                            <div className="space-y-2">
                                <p className="text-lg font-medium text-foreground">
                                    {isDragging ? 'Drop files here' : 'Drag & drop your files here'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    or{' '}
                                    <span className="text-primary font-medium hover:underline">
                                        browse from your computer
                                    </span>
                                </p>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <FileSpreadsheet className="h-4 w-4" />
                                    Excel
                                </span>
                                <span className="flex items-center gap-1">
                                    <FileText className="h-4 w-4" />
                                    CSV
                                </span>
                                <span>Max 10MB</span>
                            </div>
                        </div>
                    </div>

                    {/* Uploaded Files List */}
                    {uploadedFiles.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium text-foreground">
                                Uploaded Files ({uploadedFiles.length})
                            </h3>

                            <div className="space-y-2">
                                {uploadedFiles.map((uploadedFile) => (
                                    <div
                                        key={uploadedFile.id}
                                        className="border rounded-lg p-4 bg-card"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 mt-1">
                                                {getFileIcon(uploadedFile.file.name)}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2 mb-2">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-foreground truncate">
                                                            {uploadedFile.file.name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {formatFileSize(uploadedFile.file.size)}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {uploadedFile.status === 'success' && (
                                                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                        )}
                                                        {uploadedFile.status === 'error' && (
                                                            <AlertCircle className="h-5 w-5 text-destructive" />
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                removeFile(uploadedFile.id);
                                                            }}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* Progress Bar */}
                                                {uploadedFile.status === 'uploading' && (
                                                    <div className="space-y-1">
                                                        <Progress value={uploadedFile.progress} className="h-1.5" />
                                                        <p className="text-xs text-muted-foreground">
                                                            Uploading... {uploadedFile.progress}%
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Success Message */}
                                                {uploadedFile.status === 'success' && (
                                                    <p className="text-xs text-green-600 dark:text-green-400">
                                                        Upload complete
                                                    </p>
                                                )}

                                                {/* Error Message */}
                                                {uploadedFile.status === 'error' && uploadedFile.errorMessage && (
                                                    <p className="text-xs text-destructive">
                                                        {uploadedFile.errorMessage}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex justify-center pt-6 gap-4">
                {onBack && (
                    <Button variant="outline" onClick={onBack} className="cursor-pointer">
                        Back
                    </Button>
                )}
                {canProceed ? <LoanSubmitDialog canProceed={canProceed} /> :
                    <Button
                        onClick={onNext}
                        disabled={!canProceed}
                        className="cursor-pointer"
                    >
                        Upload Files to Continue
                    </Button>
                }


            </div>
        </div>
    );
}

