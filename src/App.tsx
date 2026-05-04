import { AuthProvider } from './shared/hooks/useAuth';
import { ThemeProvider } from './shared/hooks/useTheme';
import { ToastProvider } from './shared/hooks/useToast';
import { ToastContainer } from './shared/components/ToastContainer';
import { AppRouter } from './router';
import { VideoTutorialModal } from './shared';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <AppRouter />
          <ToastContainer />
          <VideoTutorialModal />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;