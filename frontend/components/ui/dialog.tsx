"use client"

import * as React from "react"
import { X } from "lucide-react"

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
        {children}
      </div>
    </div>
  )
}

const DialogHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center justify-between mb-4">
    {children}
  </div>
)

const DialogTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-lg font-semibold">{children}</h2>
)

const DialogContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div>{children}</div>
)

const DialogClose: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
  >
    <X className="h-4 w-4" />
  </button>
)

export { Dialog, DialogHeader, DialogTitle, DialogContent, DialogClose }
