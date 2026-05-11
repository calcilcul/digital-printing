import { registerRootComponent } from 'expo';
import './global.css'; // Pastikan CSS dimuat paling atas
import App from './App';

// registerRootComponent memastikan aplikasi bisa jalan di Expo Go maupun build native
registerRootComponent(App);
