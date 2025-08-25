import { AuthProvider } from './shared/hooks/useAuth';
import { AppRouter } from './router';

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;