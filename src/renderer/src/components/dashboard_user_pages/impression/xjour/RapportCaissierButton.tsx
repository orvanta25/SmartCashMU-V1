"use client"

import React, { useState } from 'react'
import { Users, FileOutput } from 'lucide-react'


interface RapportCaissierButtonProps {
  className?: string
}

const RapportCaissierButton: React.FC<RapportCaissierButtonProps> = ({ className }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl px-6 py-3 transition-all duration-200 shadow-lg shadow-blue-500/25 ${className}`}
      >
        <FileOutput className="w-5 h-5" />
        <span className="font-medium">Rapport Caissier</span>
      </button>


    </>
  )
}

export default RapportCaissierButton