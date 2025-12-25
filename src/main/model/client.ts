export interface Client {
    id :string
    nom : string;
    prenom : string
    email? : string
    cin : number
    tel : string;
    address? : string
    credit : number;
    //creditCartItems : CartItems
    createdAt : Date
    updatedAt : Date
}
