import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from './auth-context';
import { useTheme } from '../../theme/theme-context';
import { googleLogin } from '../../api/auth.api';
import { GOOGLE_CLIENT_ID } from '../../config/env';

/** Renders nothing unless VITE_GOOGLE_CLIENT_ID is set. The Google script is loaded once by <GoogleOAuthProvider> in main.jsx. */
export default function GoogleButton({ onDone, onError }) {
  const { establishSession } = useAuth();
  const { resolved } = useTheme();
  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <div className="flex min-h-11 justify-center">
      <GoogleLogin
        theme={resolved === 'dark' ? 'filled_black' : 'outline'}
        text="continue_with"
        shape="rectangular"
        onSuccess={async ({ credential }) => {
          try {
            await googleLogin(credential);
            await establishSession();
            onDone();
          } catch (error) {
            onError(error);
          }
        }}
        onError={() => onError(new Error('Google sign-in was cancelled or could not be completed.'))}
      />
    </div>
  );
}
