import { onMount } from 'solid-js';
import { apiClient } from '../lib/api';

export default function FilesView() {
  onMount(() => {
    if (!apiClient.isAuthenticated()) {
      window.location.href = '/auth/login';
    }
  });

  return (
    <div class="card">
      <h1>Files</h1>
      <p>Files page - content coming soon</p>
    </div>
  );
}
