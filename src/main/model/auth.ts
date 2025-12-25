export interface LoginResponse {
  user: {
    id: string;
    nom: string;
    prenom: string;
    role: string;
  }|null,
  error?:string;
}