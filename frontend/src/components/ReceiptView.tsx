import { onMount } from 'solid-js';
import { apiClient } from '../lib/api';

export default function ReceiptView() {
  onMount(() => {
    if (!apiClient.isAuthenticated()) {
      window.location.href = '/auth/login';
    }
  });

  return (
    <div class="card">
      <h1>Receipt</h1>
      <p>Receipt page - content coming soon</p>
    </div>
  );
}
