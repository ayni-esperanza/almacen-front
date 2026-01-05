import { AuthProvider } from './shared/hooks/useAuth';
import { ThemeProvider } from './shared/hooks/useTheme';
import { ToastProvider } from './shared/hooks/useToast';
import { ToastContainer } from './shared/components/ToastContainer';
import { AppRouter } from './router';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <AppRouter />
          <ToastContainer />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;