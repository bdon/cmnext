import { onMount } from 'solid-js';
import { apiClient } from '../lib/api';

export default function FileView() {
  onMount(() => {
    if (!apiClient.isAuthenticated()) {
      window.location.href = '/auth/login';
    }
  });

  return (
    <div class="card">
      <h1>File</h1>
      <p>File detail page - content coming soon</p>
    </div>
  );
}
