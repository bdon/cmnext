import { onMount } from 'solid-js';
import { apiClient } from '../lib/api';

export default function CreateFileView() {
  onMount(() => {
    if (!apiClient.isAuthenticated()) {
      window.location.href = '/auth/login';
    }
  });

  return (
    <div class="card">
      <h1>Create File</h1>
      <p>Create file page - content coming soon</p>
    </div>
  );
}
