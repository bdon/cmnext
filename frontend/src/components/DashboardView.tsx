import { createSignal, onMount, Show } from 'solid-js';
import { apiClient, type User } from '../lib/api';

export default function DashboardView() {
  const [user, setUser] = createSignal<User | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string>('');

  onMount(async () => {
    if (!apiClient.isAuthenticated()) {
      window.location.href = '/auth/login';
      return;
    }

    try {
      const userData = await apiClient.getCurrentUser();
      setUser(userData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load user data';
      setError(errorMessage);

      // Only logout and redirect if it's an authentication error (401)
      if (errorMessage.includes('401')) {
        apiClient.logout();
        setTimeout(() => {
          window.location.href = '/auth/login';
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  });

  const handleLogout = (): void => {
    apiClient.logout();
    window.location.href = '/auth/login';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div class="card">
      <h1>Dashboard</h1>

      <Show when={loading()}>
        <p>Loading...</p>
      </Show>

      <Show when={error()}>
        <div class="error">{error()}</div>
      </Show>

      <Show when={user()}>
        {(currentUser) => (
          <div id="user-info">
            <p><strong>Email:</strong> {currentUser().email}</p>
            <p>
              <strong>Member since:</strong> {formatDate(currentUser().date_joined)}
            </p>
          </div>
        )}
      </Show>

      <button
        onClick={handleLogout}
        style="margin-top: 2rem;"
        type="button"
      >
        Logout
      </button>
    </div>
  );
}
