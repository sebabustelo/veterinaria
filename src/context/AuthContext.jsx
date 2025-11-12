import React, { createContext, useContext, useState, useEffect } from 'react';
import { getErrorMessage } from '../utils/authUtils';
import usersData from '../data/adminUsuarios.json';
import {
    createUserWithEmailAndPassword,
    signInWithRedirect,
    getRedirectResult,
    signInWithPopup,
    signOut,
    updateProfile,
    GoogleAuthProvider,
    FacebookAuthProvider,
    onAuthStateChanged,
    sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../firebase';

export const AuthContext = createContext();

const buildUserFromFirebase = (firebaseUser) => {
    if (!firebaseUser) return null;

    const displayName =
        firebaseUser.displayName ||
        firebaseUser.email?.split('@')[0] ||
        'Usuario Vettix';

    const defaultRoles = [
        {
            name: 'cliente',
            display_name: 'Cliente'
        }
    ];

    return {
        id: firebaseUser.uid,
        persona_id: firebaseUser.uid,
        nombre: displayName,
        apellido: '',
        name: displayName,
        email: firebaseUser.email,
        roles: defaultRoles,
        roleNames: defaultRoles.map((role) => role.name),
        tipo: 'firebase',
        telefono: firebaseUser.phoneNumber || '',
        avatar: firebaseUser.photoURL || '',
        provider: firebaseUser.providerData[0]?.providerId || 'firebase'
    };
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Escuchar cambios en el estado de autenticación
    useEffect(() => {
        
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            console.log('onAuthStateChanged triggered:', firebaseUser);
            console.log('Firebase auth current user:', auth.currentUser);
            
            if (firebaseUser) {
                console.log('Firebase user detected:', firebaseUser.email);
                try {
                    const providerId = firebaseUser.providerData[0]?.providerId;

                    if (providerId === 'google.com') {
                        const firebaseProfile = buildUserFromFirebase(firebaseUser);
                        const tokenPayload = {
                            user: firebaseProfile,
                            issuedAt: Date.now(),
                            provider: 'google'
                        };
                        const encodedPayload = btoa(JSON.stringify(tokenPayload));
                        const fakeToken = `firebase.${encodedPayload}.auth`;
                        localStorage.setItem('token', fakeToken);
                        setUser(firebaseProfile);
                        sessionStorage.removeItem('recentLogin');
                        setLoading(false);
                        return;
                    }

                    // Para otros proveedores (por ejemplo, Facebook) mantener la lógica previa
                    // hasta que se decida un flujo específico.
                    const fallbackUser = buildUserFromFirebase(firebaseUser);
                    const tokenPayload = {
                        user: fallbackUser,
                        issuedAt: Date.now(),
                        provider: providerId || 'firebase'
                    };
                    const encodedPayload = btoa(JSON.stringify(tokenPayload));
                    const fakeToken = `firebase.${encodedPayload}.auth`;
                    localStorage.setItem('token', fakeToken);
                    setUser(fallbackUser);
                    sessionStorage.removeItem('recentLogin');
                } catch (error) {
                    console.error('Error procesando el usuario de Firebase:', error);
                    setUser(null);
                    localStorage.removeItem("token");
                    sessionStorage.removeItem('recentLogin');
                }
            } else if (localStorage.getItem("token")) {
                try {
                    const token = localStorage.getItem("token");
                    const decoded = JSON.parse(atob(token.split('.')[1]));
                    setUser(decoded.user); // Asegúrate que decoded.user tiene roles, email, etc.
                    console.log('User set from decoded token:', decoded.user);
                } catch {
                    localStorage.removeItem("token");
                    setUser(null);
                    console.log('User set to null after token decode fail');
                }
            } else {
                setUser(null);
                console.log('User set to null (no token)');
            }
            setLoading(false);
            console.log('Loading set to false');
        });

        return () => unsubscribe();
    }, []);

    // Manejar resultado de redirect (mantener por compatibilidad)
    useEffect(() => {
        
        
        const checkRedirectResult = async () => {
            try {
                if (!auth) return;
                const result = await getRedirectResult(auth);
                if (result && result.user) {
                    console.log('Procesando login social desde getRedirectResult:', result);
                    const firebaseProfile = buildUserFromFirebase(result.user);
                    const tokenPayload = {
                        user: firebaseProfile,
                        issuedAt: Date.now(),
                        provider: result.providerId || result.user.providerData[0]?.providerId || 'firebase'
                    };
                    const encodedPayload = btoa(JSON.stringify(tokenPayload));
                    const fakeToken = `firebase.${encodedPayload}.auth`;
                    localStorage.setItem('token', fakeToken);
                    setUser(firebaseProfile);
                    console.log('Login social exitoso (redirect), usuario seteado:', firebaseProfile);
                    sessionStorage.removeItem('recentLogin');
                }
            } catch (error) {
                console.error('Redirect result error:', error);
            }
        };

        checkRedirectResult();
    }, []);

    useEffect(() => {
        const handleTokenExpired = () => setUser(null);
        window.addEventListener('tokenExpired', handleTokenExpired);
        return () => window.removeEventListener('tokenExpired', handleTokenExpired);
    }, []);

    // Login con email y contraseña
    const loginWithEmail = async (email, password) => {
        setError(null);
        console.log('Iniciando login local con email:', email);

        try {
            const normalizedEmail = email?.trim().toLowerCase();
            const normalizedPassword = password?.trim();
            const credential = usersData?.credenciales?.find(
                (cred) => cred.email.trim().toLowerCase() === normalizedEmail
            );

            if (
                !credential ||
                (credential.password ?? '').trim() !== normalizedPassword
            ) {
                const message = "Credenciales incorrectas.";
                const authError = new Error(message);
                authError.code = 'auth/invalid-credential';
                setError(message);
                throw authError;
            }

            const persona = usersData?.personas?.find(
                (item) => item.id === credential.persona_id
            );

            const rawRoles = credential.roles?.length
                ? credential.roles
                : persona?.roles || [];

            const roleObjects = rawRoles.map((role) => {
                if (typeof role === 'string') {
                    return { name: role.toLowerCase(), display_name: role };
                }
                if (role && typeof role === 'object') {
                    return {
                        ...role,
                        name: (role.name || role.id || '').toLowerCase()
                    };
                }
                return { name: 'cliente', display_name: 'Cliente' };
            });

            const roleNames = roleObjects.map((role) => role.name);

            const userData = {
                id: persona?.id ?? credential.persona_id,
                persona_id: persona?.id ?? credential.persona_id,
                nombre: persona?.nombre || "",
                apellido: persona?.apellido || "",
                name: `${persona?.nombre || ''} ${persona?.apellido || ''}`.trim() || persona?.nombre || persona?.email || credential.email,
                email: credential.email,
                roles: roleObjects,
                roleNames,
                tipo: persona?.tipo || "",
                telefono: persona?.telefono || "",
                dni: persona?.dni || "",
                activo: persona?.activo ?? true
            };

            setUser(userData);

            const tokenPayload = {
                user: userData,
                issuedAt: Date.now()
            };
            const encodedPayload = btoa(JSON.stringify(tokenPayload));
            const fakeToken = `local.${encodedPayload}.auth`;

            localStorage.setItem("token", fakeToken);
            console.log('Login local exitoso, usuario establecido:', userData);

            return userData;
        } catch (error) {
            console.error('Error en loginWithEmail (local):', error);
            if (error.message) {
                setError(error.message);
            } else {
                const errorMessage = getErrorMessage(error.code);
                setError(errorMessage || "Error al iniciar sesión.");
            }
            throw error;
        }
    };

    // Registro con email y contraseña
    const registerWithEmail = async (email, password, displayName) => {
        try {
            setError(null);
            const result = await createUserWithEmailAndPassword(auth, email, password);

            // Actualizar el perfil del usuario con el nombre
            if (displayName) {
                await updateProfile(result.user, { displayName });
            }

            return result.user;
        } catch (error) {
            const errorMessage = getErrorMessage(error.code);
            setError(errorMessage);
            throw error;
        }
    };

    // Login con Google usando redirect
    const loginWithGoogle = async () => {
        try {
            setError(null);
            setLoading(true);
            const googleProvider = new GoogleAuthProvider();
            googleProvider.setCustomParameters({ prompt: 'select_account' });
            const result = await signInWithPopup(auth, googleProvider);
            const firebaseProfile = buildUserFromFirebase(result.user);
            const tokenPayload = {
                user: firebaseProfile,
                issuedAt: Date.now(),
                provider: 'google'
            };
            const encodedPayload = btoa(JSON.stringify(tokenPayload));
            const fakeToken = `firebase.${encodedPayload}.auth`;
            localStorage.setItem('token', fakeToken);
            setUser(firebaseProfile);
            console.log('Google login exitoso, usuario establecido desde Firebase:', firebaseProfile);
            setLoading(false);
        } catch (error) {
            console.error('Error en loginWithGoogle:', error);
            setError(error.message || "Error en login con Google");
            setLoading(false);
        }
    };

    // Login con Facebook usando redirect
    const loginWithFacebook = async () => {
        try {
            setError(null);
            // Establecer bandera de login reciente
            sessionStorage.setItem('recentLogin', 'true');
            // Iniciar el proceso de login con Facebook
            const facebookProvider = new FacebookAuthProvider();
            await signInWithRedirect(auth, facebookProvider);
        } catch (error) {
            const errorMessage = getErrorMessage(error.code);
            setError(errorMessage);
            throw error;
        }
    };

    // Logout
    const logout = async () => {
        try {
            setError(null);
            localStorage.removeItem("token");
            sessionStorage.removeItem("recentLogin");
            setUser(null);
            setLoading(false);
            await signOut(auth);
            window.location.href = '/login';
        } catch (error) {
            const errorMessage = getErrorMessage(error.code);
            setError(errorMessage);
            throw error;
        }
    };

    // Resetear contraseña
    const resetPassword = async (email) => {
        try {
            setError(null);
            await sendPasswordResetEmail(auth, email);
        } catch (error) {
            const errorMessage = getErrorMessage(error.code);
            setError(errorMessage);
            throw error;
        }
    };

    const value = {
        user,
        loading,
        error,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        loginWithFacebook,
        logout,
        resetPassword,
        setError
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
}; 