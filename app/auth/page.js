'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ApiService } from '../../lib/api'
import { formatPhoneToStandard } from '../../lib/utils' // Make sure this import is correct

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('login')
  const [currentLanguage, setCurrentLanguage] = useState('sw')
  const [formData, setFormData] = useState({
    loginPhone: '',
    loginPassword: '',
    registerName: '',
    registerPhone: '',
    registerLocation: '',
    registerPassword: '',
    registerRole: 'employee'
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token) {
        router.push('/dashboard')
      }

      const savedLanguage = localStorage.getItem('preferredLanguage')
      if (savedLanguage) {
        setCurrentLanguage(savedLanguage)
      }
    }
  }, [router])

  // Add the function directly here as a backup
  const formatPhone = (phone) => {
    if (!phone) return '';
    
    let cleanPhone = phone.replace(/\D/g, '
