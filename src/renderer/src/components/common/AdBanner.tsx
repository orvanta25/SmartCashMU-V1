import { useEffect, useState, useRef } from 'react'
import ooredoo from '@renderer/assets/Ad2.gif'
import telecom from '@renderer/assets/Ad1.gif'
import zitouna from '@renderer/assets/Ad3.gif'

import ooredooMobile from '@renderer/assets/AdMobile2.gif'
import telecomMobile from '@renderer/assets/AdMobile1.gif'
import zitounaMobile from '@renderer/assets/AdMobile3.gif'

type BannerItem = {
  type: string
  src: string
  alt: string
  duration: number
  link?: string // Remplacé "imageLink" par "link" qui était utilisé dans le code
}

// Configuration des bannières desktop
const mediaItems: BannerItem[] = [
  {
    type: 'gif',
    src: telecom,
    alt: 'Tunisie Telecome',
    duration: 5000,
    link: 'https://www.tunisietelecom.tn'
  },
  {
    type: 'gif',
    src: ooredoo,
    alt: 'Ooredoo',
    duration: 5000,
    link: '#ooredoo-offer'
  },
  {
    type: 'gif',
    src: zitouna,
    alt: 'Zitouna Banque',
    duration: 5000,
    link: '#zitouna-offer'
  }
]

// Bannières mobile
const mobileImage: BannerItem[] = [
  {
    type: 'image',
    src: telecomMobile,
    alt: 'Telecome Mobile',
    duration: 4000,
    link: 'https://www.tunisietelecom.tn/particulier/mobile/'
  },
  {
    type: 'image',
    src: ooredooMobile,
    alt: 'Telecome Mobile 2',
    duration: 4000,
    link: 'https://www.tunisietelecom.tn/particulier/mobile/'
  },
  {
    type: 'gif',
    src: zitounaMobile,
    alt: 'Zitouna Banque',
    duration: 5000,
    link: 'https://www.banquezitouna.com/fr'
  }
]

// Bannières POS
const posImage: BannerItem[] = [
  {
    type: 'image',
    src: telecom,
    alt: 'POS Telecome',
    duration: 5000,
    link: 'https://nawarcompany.com/'
  },
  {
    type: 'image',
    src: ooredoo,
    alt: 'POS Ooredoo',
    duration: 5000,
    link: '#pos-offer-2'
  },
  {
    type: 'gif',
    src: zitouna,
    alt: 'POS Zitouna',
    duration: 5000,
    link: '#pos-offer-3'
  }
]

export default function AdBanner() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [windowWidth, setWindowWidth] = useState<number>(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Détection de la taille de l'écran
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Gestion du carrousel automatique
  useEffect(() => {
    const getCurrentMediaList = () => {
      if (windowWidth < 768) return mobileImage
      if (windowWidth <= 1024) return posImage
      return mediaItems
    }

    const mediaList = getCurrentMediaList()
    const currentItem = mediaList[currentIndex % mediaList.length]

    timerRef.current = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % mediaList.length)
    }, currentItem.duration)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [currentIndex, windowWidth])

  // Récupération de l'item courant
  const getCurrentItem = (): BannerItem => {
    if (windowWidth < 768) return mobileImage[currentIndex % mobileImage.length]
    if (windowWidth <= 1024) return posImage[currentIndex % posImage.length]
    return mediaItems[currentIndex % mediaItems.length]
  }

  const currentItem = getCurrentItem()

  return (
    <div
      style={{ height: '96px' }}
      className="w-full relative overflow-hidden bg-transparent flex items-center justify-center"
    >
      {/* Image cliquable */}
      {currentItem.link ? (
        <a
          href={currentItem.link}
          className="w-full h-full"
          {...(currentItem.link.startsWith('http')
            ? { target: '_blank', rel: 'noopener noreferrer' }
            : {})}
        >
          <img
            src={currentItem.src}
            alt={currentItem.alt}
            className="w-full h-full object-contain"
            loading="lazy"
          />
        </a>
      ) : (
        <img
          src={currentItem.src}
          alt={currentItem.alt}
          className="w-full h-full object-contain"
          loading="lazy"
        />
      )}
    </div>
  )
}