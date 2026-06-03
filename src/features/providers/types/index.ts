export interface Provider {
  id: number;
  name: string;
  email: string;
  address: string;
  phones: string[];
  ruc?: string | null;
  banco?: string | null;
  cta?: string | null;
  cci?: string | null;
  bankAccounts?: ProviderBankAccount[];
  photoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface ProviderBankAccount {
  id?: number;
  banco: string;
  cta: string;
  cci: string;
}
