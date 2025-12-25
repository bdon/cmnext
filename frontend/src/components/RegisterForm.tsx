import { createSignal, Show } from 'solid-js';
import { apiClient } from '../lib/api';

export default function RegisterForm() {
  const [email, setEmail] = createSignal<string>('');
  const [password, setPassword] = createSignal<string>('');
  const [error, setError] = createSignal<string>('');
  const [loading, setLoading] = createSignal<boolean>(false);

  const handleRegister = async (e: SubmitEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiClient.register(email(), password());
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="register-container">
      <h2>Register</h2>

      <Show when={error()}>
        <div class="error">{error()}</div>
      </Show>

      <form onSubmit={handleRegister}>
        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            value={email()}
            onInput={(e) => setEmail(e.currentTarget.value)}
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            value={password()}
            onInput={(e) => setPassword(e.currentTarget.value)}
            required
            minLength={8}
          />
        </div>

        <button type="submit" disabled={loading()}>
          {loading() ? 'Creating account...' : 'Register'}
        </button>
      </form>
    </div>
  );
}
