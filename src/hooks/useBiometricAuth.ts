import { useState, useEffect, useCallback } from 'react';

interface BiometricAuth {
  isAvailable: boolean;
  isRegistered: boolean;
  authenticate: () => Promise<boolean>;
  register: (username: string, pincode: string) => Promise<boolean>;
  clearRegistration: () => void;
}

// Helper to convert ArrayBuffer to base64url
function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// Helper to convert base64url to ArrayBuffer
function base64urlToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(base64 + padding);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export function useBiometricAuth(): BiometricAuth {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const checkAvailability = async () => {
      // Check if WebAuthn is available
      if (!window.PublicKeyCredential) {
        console.log('WebAuthn not available: PublicKeyCredential not found');
        setIsAvailable(false);
        return;
      }

      try {
        // Check if platform authenticator is available (Face ID, Touch ID, Windows Hello)
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        console.log('Platform authenticator available:', available);
        setIsAvailable(available);
        
        // Check if user has registered biometric
        const storedCredential = localStorage.getItem('rijplanner_biometric_credential');
        setIsRegistered(!!storedCredential);
        console.log('Biometric registered:', !!storedCredential);
      } catch (error) {
        console.error('Error checking biometric availability:', error);
        setIsAvailable(false);
      }
    };
    
    checkAvailability();
  }, []);

  const register = useCallback(async (username: string, pincode: string): Promise<boolean> => {
    if (!isAvailable) {
      console.log('Cannot register: biometric not available');
      return false;
    }

    try {
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const userId = new TextEncoder().encode(username);

      console.log('Starting biometric registration for:', username);

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
            { alg: -7, type: 'public-key' },   // ES256
            { alg: -257, type: 'public-key' }, // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            residentKey: 'preferred',
          },
          timeout: 60000,
          attestation: 'none',
        },
      }) as PublicKeyCredential;

      if (credential) {
        const credentialId = bufferToBase64url(credential.rawId);
        
        // Store credential data
        const biometricData = {
          credentialId,
          username,
          pincode,
          createdAt: new Date().toISOString(),
        };
        
        localStorage.setItem('rijplanner_biometric_credential', JSON.stringify(biometricData));
        setIsRegistered(true);
        console.log('Biometric registration successful');
        return true;
      }
      
      console.log('Biometric registration failed: no credential returned');
      return false;
    } catch (error) {
      console.error('Biometric registration error:', error);
      return false;
    }
  }, [isAvailable]);

  const authenticate = useCallback(async (): Promise<boolean> => {
    if (!isAvailable) {
      console.log('Cannot authenticate: biometric not available');
      return false;
    }

    const storedData = localStorage.getItem('rijplanner_biometric_credential');
    if (!storedData) {
      console.log('Cannot authenticate: no stored credential');
      return false;
    }

    try {
      const { credentialId } = JSON.parse(storedData);
      const credentialIdBuffer = base64urlToBuffer(credentialId);

      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      console.log('Starting biometric authentication');

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          rpId: window.location.hostname,
          allowCredentials: [{
            id: credentialIdBuffer,
            type: 'public-key',
            transports: ['internal'],
          }],
          userVerification: 'required',
          timeout: 60000,
        },
      });

      console.log('Biometric authentication result:', !!assertion);
      return !!assertion;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return false;
    }
  }, [isAvailable]);

  const clearRegistration = useCallback(() => {
    localStorage.removeItem('rijplanner_biometric_credential');
    setIsRegistered(false);
    console.log('Biometric registration cleared');
  }, []);

  return {
    isAvailable,
    isRegistered,
    authenticate,
    register,
    clearRegistration,
  };
}

export function getBiometricCredentials(): { username: string; pincode: string } | null {
  const storedData = localStorage.getItem('rijplanner_biometric_credential');
  if (!storedData) return null;
  
  try {
    const { username, pincode } = JSON.parse(storedData);
    return { username, pincode };
  } catch {
    return null;
  }
}
