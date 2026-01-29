import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import toast, { ToastOptions } from "react-hot-toast"
import { ReactNode } from "react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Toast utility functions for consistent styling
export const toastStyles = {
  success: {
    icon: '✅',
    style: {
      background: '#10B981',
      color: '#fff',
      padding: '12px 16px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      fontWeight: 500,
    },
    duration: 3000,
  },
  error: {
    icon: '❌',
    style: {
      background: '#EF4444',
      color: '#fff',
      padding: '12px 16px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      fontWeight: 500,
    },
    duration: 4000,
  },
  warning: {
    icon: '⚠️',
    style: {
      background: '#F59E0B',
      color: '#fff',
      padding: '12px 16px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      fontWeight: 500,
    },
    duration: 4000,
  },
  info: {
    icon: 'ℹ️',
    style: {
      background: '#3B82F6',
      color: '#fff',
      padding: '12px 16px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', 
      fontWeight: 500,
    },
    duration: 3000,
  },
  preview: {
    style: {
      background: '#fff',
      color: '#334155',
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      maxWidth: '500px',
      width: '100%',
    },
    duration: 5000,
  }
}

export const showToast = {
  success: (message: string, options?: ToastOptions) => 
    toast.success(message, { ...toastStyles.success, ...options }),
  
  error: (message: string, options?: ToastOptions) => 
    toast.error(message, { ...toastStyles.error, ...options }),
  
  warning: (message: string, options?: ToastOptions) => 
    toast(message, { ...toastStyles.warning, ...options }),
  
  info: (message: string, options?: ToastOptions) => 
    toast(message, { ...toastStyles.info, ...options }),
  
  preview: (content: string | ReactNode, options?: ToastOptions) => 
    toast(content as any, { ...toastStyles.preview, ...options }),
  
  custom: (content: string | ReactNode, options: ToastOptions) => 
    toast(content as any, options)
}
