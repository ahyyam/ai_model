"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { UploadCloud, X, CheckCircle, AlertCircle, Camera, Image as ImageIcon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useIsMobile } from "@/hooks/use-mobile"

interface FileUploaderProps {
  file: File | null | undefined
  setFile: (file: File | null) => void
  title?: string
  description?: string
}

export default function FileUploader({ file, setFile, title, description }: FileUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [dragActive, setDragActive] = useState(false)
  const isMobile = useIsMobile()

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        const selectedFile = acceptedFiles[0]
        
        // Validate file before processing
        const validation = validateFile(selectedFile)
        if (!validation.valid) {
          setUploadStatus('error')
          // Show error message (you could add a toast notification here)
          console.error(validation.error)
          setTimeout(() => setUploadStatus('idle'), 3000)
          return
        }
        
        setUploadStatus('uploading')
        
        // Simulate upload delay for better UX
        setTimeout(() => {
          try {
            setFile(selectedFile)
            setPreview(URL.createObjectURL(selectedFile))
            setUploadStatus('success')
            
            // Reset status after showing success
            setTimeout(() => setUploadStatus('idle'), 2000)
          } catch (error) {
            console.error('Error processing file:', error)
            setUploadStatus('error')
            setTimeout(() => setUploadStatus('idle'), 3000)
          }
        }, 500)
      }
    },
    [setFile],
  )

  const { getRootProps, getInputProps, isDragActive: dropzoneDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
    disabled: uploadStatus === 'uploading',
  })

  // Update drag state
  useEffect(() => {
    setDragActive(dropzoneDragActive)
  }, [dropzoneDragActive])

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation()
    setFile(null)
    setPreview(null)
    setUploadStatus('idle')
  }

  // File validation
  const validateFile = (file: File) => {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    
    if (!validTypes.includes(file.type)) {
      return { valid: false, error: 'Please upload a valid image file (JPG, PNG, or WEBP)' }
    }
    
    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 10MB' }
    }
    
    return { valid: true }
  }

  if (file && preview) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full aspect-[3/2] border-2 border-dashed border-green-500/50 rounded-xl p-2 bg-green-500/5"
      >
        <img 
          src={preview || "/placeholder.svg"} 
          alt="Preview" 
          className="w-full h-full object-contain rounded-lg" 
        />
        
        {/* Success indicator */}
        <div className="absolute top-3 left-3 bg-green-500 rounded-full p-1.5">
          <CheckCircle className="h-4 w-4 text-white" />
        </div>
        
        <button
          onClick={removeFile}
          className="absolute top-3 right-3 bg-black/80 text-white rounded-full p-2 hover:bg-black/90 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        
        {/* File info */}
        <div className="absolute bottom-3 left-3 right-3 bg-black/80 rounded-lg p-2">
          <p className="text-xs text-white font-medium truncate">{file.name}</p>
          <p className="text-xs text-gray-300">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      {...getRootProps()}
      className={`w-full aspect-[3/2] border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 touch-manipulation relative overflow-hidden ${
        dragActive
          ? "bg-blue-500/20 border-blue-500 scale-105"
          : uploadStatus === 'uploading'
          ? "bg-yellow-500/10 border-yellow-500"
          : "bg-gray-900/30 border-gray-600 hover:bg-gray-800/50 hover:border-gray-500 active:bg-gray-800/70"
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <input {...getInputProps()} />
      
      {/* Upload status overlay */}
      <AnimatePresence>
        {uploadStatus === 'uploading' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 flex items-center justify-center"
          >
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-2"></div>
              <p className="text-yellow-400 text-sm font-medium">Processing...</p>
            </div>
          </motion.div>
        )}
        
        {uploadStatus === 'error' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center"
          >
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
              <p className="text-red-400 text-sm font-medium">Upload failed</p>
              <p className="text-red-300 text-xs">Please try again</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-1 relative z-10">
        {/* Icon */}
        <div className="mb-0.5">
          {isMobile ? (
            <div className="relative">
              <Camera className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-gray-400 mx-auto" />
              <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                <ImageIcon className="h-3 w-3 text-white" />
              </div>
            </div>
          ) : (
            <UploadCloud className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-gray-400 mx-auto mb-0.5" />
          )}
        </div>

        {/* Title */}
        <h3 className="font-sora text-xs font-semibold text-white mb-0.5">
          {title || "Upload Image"}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-gray-300 text-xs mb-0.5">{description}</p>
        )}

        {/* Upload instructions */}
        <div className="space-y-0.5 mb-0.5">
          {isMobile ? (
            <p className="text-gray-300 font-medium text-xs">Tap to select from gallery</p>
          ) : (
            <p className="text-gray-300 font-medium text-xs">Drag and drop or click to browse</p>
          )}
          <p className="text-xs text-gray-400">PNG, JPG, or WEBP • Max 10MB</p>
        </div>

        {/* Quality tip */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg px-1 py-0.5 inline-block">
          <p className="text-xs text-blue-300 font-medium">
            {isMobile ? "📱 Use high-quality photos" : "✨ Ensure high quality for best results"}
          </p>
        </div>

        {/* Mobile-specific tips */}
        {isMobile && (
          <div className="mt-0.5 text-xs text-gray-500">
            <p>💡 Tip: Take photos in good lighting</p>
          </div>
        )}
      </div>

      {/* Drag indicator */}
      {dragActive && (
        <div className="absolute inset-0 bg-blue-500/20 border-2 border-blue-500 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <UploadCloud className="h-12 w-12 text-blue-400 mx-auto mb-2" />
            <p className="text-blue-400 font-medium">Drop your image here</p>
          </div>
        </div>
      )}
    </motion.div>
  )
}
