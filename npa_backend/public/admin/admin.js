document.addEventListener('DOMContentLoaded', async () => {
  await loadAdminData();

  document.getElementById('genCodeBtn').addEventListener('click', async () => {
    const btn = document.getElementById('genCodeBtn');
    btn.disabled = true;
    btn.textContent = 'Generating...';
    try {
      const res = await fetch('/api/admin/generate-code', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        document.getElementById('newCodeDisplay').textContent = data.code;
        loadAdminData();
      }
    } catch (err) {
      console.error('Failed to generate code', err);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Generate New Code';
    }
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    window.location.href = '/logout';
  });
});

async function loadAdminData() {
  try {
    const res = await fetch('/api/admin/dashboard-data');
    if (!res.ok) throw new Error('Unauthorized');
    const data = await res.json();

    // Render Codes
    const codesList = document.getElementById('codesList');
    codesList.innerHTML = data.authCodes.length 
      ? data.authCodes.map(code => `
          <li>
            <span style="font-family:monospace; font-weight:600; letter-spacing:1px;">${code}</span>
            <button class="btn-danger" onclick="revokeCode('${code}')">Revoke</button>
          </li>`).join('')
      : '<li class="empty-state">No active codes</li>';

    // Render Users
    const usersList = document.getElementById('usersList');
    usersList.innerHTML = data.users.length
      ? data.users.map(u => `
          <tr>
            <td>${u.email}</td>
            <td><span class="status-badge status-${u.status}">${u.status.toUpperCase()}</span></td>
            <td>${new Date(u.createdAt).toLocaleDateString()}</td>
            <td>
              <button class="btn-success" onclick="updateUserStatus(${u.id}, 'approved')">Approve</button>
              <button class="btn-danger" onclick="updateUserStatus(${u.id}, 'denied')">Deny</button>
            </td>
          </tr>`).join('')
      : '<tr><td colspan="4" class="empty-state">No users registered yet</td></tr>';
  } catch (err) {
    console.error('Load failed:', err);
    window.location.href = '/login';
  }
}

window.revokeCode = async (code) => {
  if (!confirm(`Revoke code ${code}?`)) return;
  await fetch(`/api/admin/codes/${code}`, { method: 'DELETE' });
  loadAdminData();
};

window.updateUserStatus = async (id, status) => {
  await fetch(`/api/admin/users/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  loadAdminData();
};