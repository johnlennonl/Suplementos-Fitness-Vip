/**
 * Login Logic
 * Suplementos Fitness VIP
 */

import { auth } from '../firebase-config.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMsg = document.getElementById('login-error');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Redirect to Dashboard
            window.location.href = 'dashboard.html';

        } catch (error) {
            console.error("Error al iniciar sesión:", error.code);
            switch (error.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    errorMsg.innerText = "Email o contraseña incorrectos.";
                    break;
                case 'auth/too-many-requests':
                    errorMsg.innerText = "Demasiados intentos. Intenta más tarde.";
                    break;
                default:
                    errorMsg.innerText = "Ocurrió un error inesperado al acceder.";
            }
        }
    });
});
