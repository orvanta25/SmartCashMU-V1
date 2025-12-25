"use client"

import React, { useState } from 'react'
import { Archive, Printer } from 'lucide-react'


interface ClotureJourButtonProps {
  className?: string
}

const ClotureJourButton: React.FC<ClotureJourButtonProps> = ({ className }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl px-6 py-3 transition-all duration-200 shadow-lg shadow-purple-500/25 ${className}`}
      >
        <Archive className="w-5 h-5" />
        <span className="font-medium">Clôture de Jour</span>
      </button>
    </>
  )
}

export default ClotureJourButton