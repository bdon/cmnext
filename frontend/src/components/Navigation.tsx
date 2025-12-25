import { createSignal, onMount } from 'solid-js';
import { apiClient } from '../lib/api';

export default function Navigation() {
  const [isAuthenticated, setIsAuthenticated] = createSignal<boolean>(false);

  onMount(() => {
    setIsAuthenticated(apiClient.isAuthenticated());
  });

  const handleLogout = () => {
    apiClient.logout();
    setIsAuthenticated(false);
    window.location.href = '/';
  };

  return (
    <nav class="nav">
      <a href="/">Home</a>
      {isAuthenticated() ? (
        <>
          <a href="/dashboard">Dashboard</a>
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              color: '#007bff',
              border: 'none',
              cursor: 'pointer',
              'text-decoration': 'underline',
              padding: '0',
              width: 'auto',
              margin: '0',
              'font-size': '1rem',
            }}
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <a href="/auth/login">Login</a>
          <a href="/auth/register">Register</a>
        </>
      )}
    </nav>
  );
}
