import {AngryIcon} from 'lucide-react'
import { Link } from 'react-router-dom'
export default function NotFound(){
    return(
        <div className="bg-orvanta h-screen flex justify-center items-center">
        <div className="w-100 h-80 bg-white m-auto flex p-20 rounded-3xl flex-col gap-4 text-center">
            <div>
                <h1 className='text-black'>Page Introuvable Contactez l'entreprise</h1>
            <AngryIcon color='blue' style={{
                margin:"auto"
            }} />
            </div>
            <Link to="/dashboard_user" className='text-gray-700 underline pointer-cursor'>
            Revenir au Dashboard
            </Link>
        </div>
        </div>
    )
}