export interface Provider {
  id: number;
  name: string;
  email: string;
  address: string;
  phones: string[];
  photoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}
