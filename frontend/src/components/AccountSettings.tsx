import { createSignal, Show, onMount } from 'solid-js';
import { apiClient, type User } from '../lib/api';

export default function AccountSettings() {
  const [user, setUser] = createSignal<User | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = createSignal(false);
  const [password, setPassword] = createSignal('');
  const [error, setError] = createSignal('');
  const [deleting, setDeleting] = createSignal(false);

  onMount(async () => {
    if (!apiClient.isAuthenticated()) {
      window.location.href = '/auth/login';
      return;
    }

    try {
      const userData = await apiClient.getCurrentUser();
      setUser(userData);
    } catch (err) {
      setError('Failed to load account information');
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 2000);
    } finally {
      setLoading(false);
    }
  });

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
    setError('');
    setPassword('');
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setPassword('');
    setError('');
  };

  const handleConfirmDelete = async (e: SubmitEvent) => {
    e.preventDefault();
    setError('');
    setDeleting(true);

    try {
      await apiClient.deleteAccount(password());

      // Logout and redirect
      apiClient.logout();
      alert('Your account has been deleted successfully.');
      window.location.href = '/';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div class="account-settings">
      <h2>Account Settings</h2>

      <Show when={loading()}>
        <p>Loading...</p>
      </Show>

      <Show when={!loading() && user()}>
        {(currentUser) => (
          <div>
            <div class="settings-section">
              <h3>Account Information</h3>
              <div class="info-row">
                <strong>Email:</strong> {currentUser().email}
              </div>
              <div class="info-row">
                <strong>Member since:</strong>{' '}
                {new Date(currentUser().date_joined).toLocaleDateString()}
              </div>
              <div class="info-row">
                <strong>Status:</strong>{' '}
                {currentUser().is_active ? 'Active' : 'Inactive'}
              </div>
            </div>

            <div class="settings-section danger-zone">
              <h3 style="color: #dc3545;">Danger Zone</h3>
              <p style="color: #666; margin-bottom: 1rem;">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button
                onClick={handleDeleteClick}
                style={{
                  background: '#dc3545',
                  'border-color': '#dc3545',
                }}
                type="button"
              >
                Delete Account
              </button>
            </div>
          </div>
        )}
      </Show>

      {/* Delete Confirmation Modal */}
      <Show when={showDeleteConfirm()}>
        <div class="modal-overlay" onClick={handleCancelDelete}>
          <div class="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style="color: #dc3545; margin-bottom: 1rem;">
              ⚠️ Confirm Account Deletion
            </h3>

            <p style="margin-bottom: 1rem; color: #666;">
              This action <strong>cannot be undone</strong>. This will permanently delete your account.
            </p>

            <Show when={error()}>
              <div class="error">{error()}</div>
            </Show>

            <form onSubmit={handleConfirmDelete}>
              <div class="form-group">
                <label for="password">
                  Please enter your password to confirm:
                </label>
                <input
                  type="password"
                  id="password"
                  value={password()}
                  onInput={(e) => setPassword(e.currentTarget.value)}
                  required
                  placeholder="Your password"
                  autofocus
                />
              </div>

              <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                <button
                  type="button"
                  onClick={handleCancelDelete}
                  style={{
                    background: '#6c757d',
                    flex: '1',
                  }}
                  disabled={deleting()}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: '#dc3545',
                    flex: '1',
                  }}
                  disabled={deleting()}
                >
                  {deleting() ? 'Deleting...' : 'Delete My Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Show>

      <style>{`
        .account-settings {
          max-width: 600px;
          margin: 0 auto;
        }

        .settings-section {
          margin-bottom: 2rem;
          padding: 1.5rem;
          border: 1px solid #ddd;
          border-radius: 8px;
        }

        .settings-section h3 {
          margin-top: 0;
          margin-bottom: 1rem;
        }

        .danger-zone {
          border-color: #dc3545;
          background: #fff5f5;
        }

        .info-row {
          padding: 0.5rem 0;
          border-bottom: 1px solid #eee;
        }

        .info-row:last-child {
          border-bottom: none;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
          max-width: 500px;
          width: 90%;
        }
      `}</style>
    </div>
  );
}
