import QRCode from "react-qr-code";
import { getServerLink } from '@renderer/api/ip'
import { toast } from 'react-toastify'
import { useEffect, useState } from "react";

export default function QRGenerator() {
  const [link,setLink] = useState("")

  const fetchLink = async () => {
    try {
      const fetchedLink = await getServerLink()
      if(!fetchedLink)return
      setLink(fetchedLink)
    } catch (error) {
      toast.error("impossible de recuperer le lien du serveur")
    }
  }
  
  useEffect(()=>{
    fetchLink()
  },[])
  return (
    <div style={{ padding: 10,backgroundColor:"#fff",display:"flex", flexDirection:"column" }} className="absolute bottom-0">
      <QRCode
        value={link}
        size={150}
        bgColor="#ffffff"
        fgColor="#000000"
      />

      <p style={{ marginTop: 10, fontFamily: "monospace",color:"#000" }}>
        {link}
      </p>
    </div>
  );
}
