import { createSignal, Show } from 'solid-js';
import { apiClient } from '../lib/api';

export default function LoginForm() {
  const [email, setEmail] = createSignal<string>('');
  const [password, setPassword] = createSignal<string>('');
  const [error, setError] = createSignal<string>('');
  const [loading, setLoading] = createSignal<boolean>(false);
  const [showMagicLink, setShowMagicLink] = createSignal<boolean>(false);
  const [magicLinkSent, setMagicLinkSent] = createSignal<boolean>(false);

  const handleLogin = async (e: SubmitEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiClient.login(email(), password());
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: SubmitEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiClient.requestMagicLink(email());
      setMagicLinkSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send magic link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="login-container">
      <h2>Login</h2>

      <Show when={error()}>
        <div class="error">{error()}</div>
      </Show>

      <Show when={magicLinkSent()}>
        <div class="success">Magic link sent! Check your email.</div>
      </Show>

      <Show when={showMagicLink()} fallback={
        <form onSubmit={handleLogin}>
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
            />
          </div>

          <button type="submit" disabled={loading()}>
            {loading() ? 'Logging in...' : 'Login'}
          </button>

          <button
            type="button"
            class="link-button"
            onClick={() => setShowMagicLink(true)}
          >
            Or login with magic link
          </button>
        </form>
      }>
        <form onSubmit={handleMagicLink}>
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

          <button type="submit" disabled={loading()}>
            {loading() ? 'Sending...' : 'Send Magic Link'}
          </button>

          <button
            type="button"
            class="link-button"
            onClick={() => setShowMagicLink(false)}
          >
            Back to password login
          </button>
        </form>
      </Show>
    </div>
  );
}
