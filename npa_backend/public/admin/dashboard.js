// Global data stores
let expolsData = [];
let ambData = [];
let currentRecord = null;

// Fetch live data from backend
async function loadDashboardData() {
  try {
    const [expRes, ambRes] = await Promise.all([
      fetch('/api/expols', { credentials: 'same-origin' }),
      fetch('/api/ambassadors', { credentials: 'same-origin' })
    ]);
    
    expolsData = (await expRes.json()).data || [];
    ambData = (await ambRes.json()).data || [];
    
    updateMetrics();
    renderTables();
    initActivityFeed();
  } catch (err) {
    console.error('Failed to load dashboard data:', err);
    document.querySelector('.content-area').innerHTML = '<h2 style="text-align:center;padding:40px;">⚠️ Error loading data. Please refresh.</h2>';
  }
}

function updateMetrics() {
  document.getElementById('metric-expols').textContent = expolsData.length;
  document.getElementById('metric-ambassadors').textContent = ambData.length;
  document.getElementById('metric-pending').textContent = 
    expolsData.filter(d => d.status === 'pending').length + 
    ambData.filter(d => d.status === 'pending').length;
  document.getElementById('metric-total').textContent = expolsData.length + ambData.length;
}

function renderTables() {
  // EXPOLS Table
  const expTbody = document.getElementById('expols-tbody');
  expTbody.innerHTML = expolsData.map(d => `
    <tr>
      <td><strong>${d.fullName || 'N/A'}</strong></td>
      <td>${d.email || 'N/A'}</td>
      <td>${d.phone || 'N/A'}</td>
      <td>${(d.school || '').split('-')[0] || 'N/A'}</td>
      <td>${d.state || 'N/A'}</td>
      <td><span class="status-badge status-${d.status || 'pending'}">${d.status || 'Pending'}</span></td>
      <td>
        <button class="btn btn-outline" style="padding:4px 8px;font-size:0.75rem;" onclick="openModal('expols', ${d.id})">View</button>
        <button class="btn btn-success" style="padding:4px 8px;font-size:0.75rem;" onclick="updateStatus('verified', ${d.id})">✓</button>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="7" style="text-align:center;padding:20px;">No registrations yet</td></tr>';

  // AMBASSADORS Table
  const ambTbody = document.getElementById('ambassadors-tbody');
  ambTbody.innerHTML = ambData.map(d => `
    <tr>
      <td><strong>${d.fullName || 'N/A'}</strong></td>
      <td>${d.email || 'N/A'}</td>
      <td>${d.organization || 'N/A'}</td>
      <td>${d.ambassadorType || 'N/A'}</td>
      <td>${d.supportType || 'N/A'}</td>
      <td><span class="status-badge status-${d.status || 'pending'}">${d.status || 'Pending'}</span></td>
      <td>
        <button class="btn btn-outline" style="padding:4px 8px;font-size:0.75rem;" onclick="openModal('ambassador', ${d.id})">View</button>
        <button class="btn btn-success" style="padding:4px 8px;font-size:0.75rem;" onclick="updateStatus('verified', ${d.id})">✓</button>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="7" style="text-align:center;padding:20px;">No registrations yet</td></tr>';

  // VERIFICATION QUEUE
  const verTbody = document.getElementById('verification-tbody');
  const pending = [...expolsData, ...ambData].filter(d => !d.status || d.status === 'pending');
  verTbody.innerHTML = pending.map(d => `
    <tr>
      <td>${d.school ? 'EXPOLS' : 'Ambassador'}</td>
      <td>${d.fullName || 'N/A'}</td>
      <td>${d.nin || d.email || 'N/A'}</td>
      <td>${d.registeredAt ? new Date(d.registeredAt).toLocaleDateString() : 'N/A'}</td>
      <td>
        <button class="btn btn-success" style="padding:4px 8px;font-size:0.75rem;" onclick="updateStatus('verified', ${d.id})">Verify</button>
        <button class="btn btn-danger" style="padding:4px 8px;font-size:0.75rem;" onclick="updateStatus('rejected', ${d.id})">Reject</button>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="5" style="text-align:center;padding:20px;">No pending verifications</td></tr>';
}

function openModal(type, id) {
  currentRecord = type === 'expols' ? expolsData.find(d => d.id === id) : ambData.find(d => d.id === id);
  if(!currentRecord) return;
  
  const details = document.getElementById('modal-details');
  details.innerHTML = Object.entries(currentRecord)
    .filter(([k]) => !['id','registeredAt','passport','ssceCert','supportDoc'].includes(k))
    .map(([k,v]) => `
      <div class="form-group">
        <label>${k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
        <input value="${v || 'N/A'}" readonly>
      </div>
    `).join('');

  document.getElementById('modal-files').innerHTML = `
    ${currentRecord.passport ? `<div style="text-align:center;"><a href="${currentRecord.passport}" target="_blank"><img src="${currentRecord.passport}" class="file-preview"></a><br><small>Passport</small></div>` : ''}
    ${currentRecord.ssceCert ? `<div style="text-align:center;"><a href="${currentRecord.ssceCert}" target="_blank"><img src="${currentRecord.ssceCert}" class="file-preview"></a><br><small>SSCE</small></div>` : ''}
    ${currentRecord.supportDoc ? `<div style="text-align:center;"><a href="${currentRecord.supportDoc}" target="_blank"><img src="${currentRecord.supportDoc}" class="file-preview"></a><br><small>Support Doc</small></div>` : ''}
  `;

  document.getElementById('record-modal').classList.add('active');
}

function closeModal() {
  document.getElementById('record-modal').classList.remove('active');
  currentRecord = null;
}

async function updateStatus(status, id) {
  if(id) {
    const record = expolsData.find(d => d.id === id) || ambData.find(d => d.id === id);
    if(record) record.status = status;
    
    // Send to backend
    try {
      await fetch(`/api/update-status/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ status })
      });
    } catch(err) { console.error('Status update failed:', err); }
  } else if(currentRecord) {
    currentRecord.status = status;
  }
  renderTables();
  updateMetrics();
  closeModal();
}

function initActivityFeed() {
  const feed = document.getElementById('activity-feed');
  if(!feed) return;
  const recent = [...expolsData, ...ambData].slice(-5).reverse();
  feed.innerHTML = recent.map(r => `
    <div style="display:flex; gap:12px; padding:12px 0; border-bottom:1px solid var(--border);">
      <div style="width:32px; height:32px; border-radius:50%; background:var(--primary-light); display:flex; align-items:center; justify-content:center; color:var(--primary);">
        <i class="fas ${r.school ? 'fa-user-graduate' : 'fa-handshake'}"></i>
      </div>
      <div>
        <div style="font-size:13px; font-weight:500;">New ${r.school ? 'EXPOLS' : 'Ambassador'}: ${r.fullName}</div>
        <div style="font-size:11px; color:var(--text-light);">${r.registeredAt ? new Date(r.registeredAt).toLocaleString() : 'Just now'}</div>
      </div>
    </div>
  `).join('') || '<p style="padding:20px;text-align:center;color:var(--text-light);">No recent activity</p>';
}

// Navigation & UI Init
document.addEventListener('DOMContentLoaded', () => {
  loadDashboardData();
  
  // Load user email
  fetch('/api/check-auth', { credentials: 'same-origin' })
    .then(res => res.json())
    .then(data => {
      if(data.user?.email) document.getElementById('user-email').textContent = data.user.email;
    });

  // Sidebar Navigation
  document.querySelectorAll('.nav-link[data-target]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      link.classList.add('active');
      document.getElementById(link.dataset.target).classList.add('active');
      document.getElementById('page-title').textContent = link.textContent.trim();
    });
  });

  // Filters
  ['expols', 'ambassadors'].forEach(type => {
    const search = document.getElementById(`${type}-search`);
    const status = document.getElementById(`${type}-status-filter`);
    if(search) search.addEventListener('input', () => renderTables());
    if(status) status.addEventListener('change', () => renderTables());
  });

  // Mobile Menu
  const menuToggle = document.getElementById('menu-toggle');
  if(menuToggle) {
    menuToggle.addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
    });
  }
});