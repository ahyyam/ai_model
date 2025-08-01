"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { UploadCloud, X } from "lucide-react"

interface FileUploaderProps {
  file: File | null | undefined
  setFile: (file: File | null) => void
  title?: string
}

export default function FileUploader({ file, setFile, title }: FileUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        const selectedFile = acceptedFiles[0]
        setFile(selectedFile)
        setPreview(URL.createObjectURL(selectedFile))
      }
    },
    [setFile],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  })

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation()
    setFile(null)
    setPreview(null)
  }

  if (file && preview) {
    return (
      <div className="relative w-full aspect-square border-2 border-dashed border-gray-600 rounded-lg p-2">
        <img src={preview || "/placeholder.svg"} alt="Preview" className="w-full h-full object-contain rounded-md" />
        <button
          onClick={removeFile}
          className="absolute top-2 right-2 bg-gray-800/80 text-white rounded-full p-1.5 hover:bg-gray-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className={`w-full aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 touch-manipulation ${
        isDragActive
          ? "bg-blue-500/10 border-blue-500"
          : "bg-gray-900/30 border-gray-600 hover:bg-gray-800/50 hover:border-gray-500 active:bg-gray-800/70"
      }`}
    >
      <input {...getInputProps()} />
      <div className="p-4 sm:p-6 md:p-8">
        <UploadCloud className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 text-gray-400 mb-3 sm:mb-4 mx-auto" />
        <h3 className="font-sora text-base sm:text-lg font-semibold text-white mb-2">{title || "Upload Image"}</h3>
        <p className="text-gray-300 font-medium mb-1 text-sm sm:text-base">Tap to upload or drag and drop</p>
        <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">PNG, JPG, or WEBP</p>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 inline-block">
          <p className="text-xs text-blue-300 font-medium">Ensure high quality for best results</p>
        </div>
      </div>
    </div>
  )
}
