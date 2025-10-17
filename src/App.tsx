import { AuthProvider } from './shared/hooks/useAuth';
import { ThemeProvider } from './shared/hooks/useTheme';
import { AppRouter } from './router';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;