//orvanta-frontend\app\types\admin.ts
export interface RegisterAdminDto {
  nom: string;
  prenom: string;
  email: string;
  password: string;
}

export interface LoginAdminDto {
  email: string;
  password: string;
}

export interface VerifyAdminDto {
  token: string;
  action: 'accept' | 'reject';
}