import { Provider } from '../types';

const mockProviders: Provider[] = [
  {
    id: 1,
    name: 'Ejemplo 1',
    email: 'ejemplo1@gmail.com',
    address: 'Ejemplo 123',
    phones: ['123456789', '123456789'],
    photoUrl: '',
  },
  {
    id: 2,
    name: 'Ejemplo 2',
    email: 'ejemplo2@gmail.com',
    address: 'Ejemplo 123',
    phones: ['123456789', '123456789', '123456789'],
    photoUrl: '',
  },
  {
    id: 3,
    name: 'Ejemplo 3',
    email: 'ejemplo3@gmail.com',
    address: 'Ejemplo 123',
    phones: ['123456789', '123456789'],
    photoUrl: '',
  },
  {
    id: 4,
    name: 'Ejemplo 4',
    email: 'ejemplo4@gmail.com',
    address: 'Ejemplo 123',
    phones: ['123456789'],
    photoUrl: '',
  },
];

export const providersService = {
  getAllProviders: async (): Promise<Provider[]> => {
    // Simulación de llamada a API
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockProviders), 500);
    });
  },
};
