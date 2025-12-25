// app/types/ticket.ts

export interface TicketArticle {
  id: string | number;  
  name: string;        
  quantity: number;    
  unitPrice: number;  
  totalPrice: number;  
}

export interface EntrepriseInfo {
  nom: string;        
  logoUrl?: string;   
  telephone?: string;  
  adresse?: string;    
}

export interface TicketModel {
  entreprise: EntrepriseInfo;
  articles: TicketArticle[];
  total: number;       
  ticketNumber?: string; 
  caissier?: string;   
  date?: string;       
  paymentMethod?: "ESPECE" | "TPE" | "TICKET"; 
}


export interface TicketComponentProps {
  cartItems: TicketArticle[];
  total: number;
  entreprise: EntrepriseInfo;
}