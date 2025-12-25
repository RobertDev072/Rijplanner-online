import { useState, useEffect, useCallback } from 'react';

interface BiometricAuth {
  isAvailable: boolean;
  isRegistered: boolean;
  authenticate: () => Promise<boolean>;
  register: (username: string) => Promise<boolean>;
}

export function useBiometricAuth(): BiometricAuth {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    // Check if WebAuthn is available
    const checkAvailability = async () => {
      if (window.PublicKeyCredential) {
        try {
          const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          setIsAvailable(available);
          
          // Check if user has registered biometric
          const storedCredential = localStorage.getItem('biometric_credential_id');
          setIsRegistered(!!storedCredential);
        } catch {
          setIsAvailable(false);
        }
      }
    };
    checkAvailability();
  }, []);

  const register = useCallback(async (username: string): Promise<boolean> => {
    if (!isAvailable) return false;

    try {
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const userId = new Uint8Array(16);
      crypto.getRandomValues(userId);

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: {
            name: 'RijPlanner',
            id: window.location.hostname,
          },
          user: {
            id: userId,
            name: username,
            displayName: username,
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' },
            { alg: -257, type: 'public-key' },
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
          },
          timeout: 60000,
        },
      }) as PublicKeyCredential;

      if (credential) {
        // Store credential ID and username for later authentication
        localStorage.setItem('biometric_credential_id', credential.id);
        localStorage.setItem('biometric_username', username);
        setIsRegistered(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Biometric registration failed:', error);
      return false;
    }
  }, [isAvailable]);

  const authenticate = useCallback(async (): Promise<boolean> => {
    if (!isAvailable || !isRegistered) return false;

    try {
      const credentialId = localStorage.getItem('biometric_credential_id');
      if (!credentialId) return false;

      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          rpId: window.location.hostname,
          allowCredentials: [{
            id: Uint8Array.from(atob(credentialId.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)),
            type: 'public-key',
          }],
          userVerification: 'required',
          timeout: 60000,
        },
      });

      return !!assertion;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  }, [isAvailable, isRegistered]);

  return {
    isAvailable,
    isRegistered,
    authenticate,
    register,
  };
}

export function getBiometricUsername(): string | null {
  return localStorage.getItem('biometric_username');
}
