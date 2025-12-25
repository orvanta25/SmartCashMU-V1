import { UserProfile } from "./user";
import {Entreprise} from '../api/entreprise'
import { CreateEntrepriseDto } from "@renderer/types/auth";

export interface LoginRequest {
  pin: string;
}

export interface LoginResponse {
  user: {
    id: string;
    nom: string;
    prenom: string;
    role: string;
  },
  error?:string;
}

export interface Register{
  user: UserProfile,
  entreprise:Entreprise,
  error?:string
  
}

export function firstLogin(credentials: LoginRequest): Promise<LoginResponse> {
  return new Promise((resolve, _) => {
    window.electron.ipcRenderer.send("/auth/firstlogin", {
      pin: credentials.pin,
    });

    window.electron.ipcRenderer.once(
      "/auth/firstlogin",
      (_, data: LoginResponse) => {
        
          resolve(data);
        }
    );

  });
}

export  function login(emailPassword){
return ""+emailPassword
}

export  function register(payload:CreateEntrepriseDto):Promise<Register>{
  return new Promise((resolve, reject) => {
      window.electron.ipcRenderer.send("/auth/login", payload);

      window.electron.ipcRenderer.once(
        "/auth/login",
        (_, data: Register) => {
        
          if(data.error)
            reject(data);

          else
            resolve(data);
          }
      );

    });
}

export  function refresh(){

  return ""
}

export  function logout(){
  return ""
}

export  function forgotPassword({email}){

  return ""+email
}

type ResetPasswordParams = {
  token: string;
  newPassword: string;
  confirmNewPassword: string;
};

export function resetPassword(params: ResetPasswordParams) {
  return ""+{...params};
}