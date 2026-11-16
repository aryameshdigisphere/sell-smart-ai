import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { PolicyPages, getPolicyPage } from './PolicyPages';
import './index.css';

// Public policy pages (required by Razorpay) are served without sign-in.
const policyPage = getPolicyPage(window.location.pathname);
createRoot(document.getElementById('root')!).render(policyPage ? <PolicyPages page={policyPage} /> : <App />);
