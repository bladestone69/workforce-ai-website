const $ = id => document.getElementById(id);
const status = $('status');
const login = $('login');
const dashboard = $('dashboard');
const requestForm = $('request-code');
const verifyForm = $('verify-code');
const logout = $('logout');
let challengeId = '';
let leads = [];

function message(text) { status.textContent = text; }

async function api(path, options) {
    const response = await fetch(path, { credentials: 'same-origin', cache: 'no-store', ...options });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'The request could not be completed.');
    return data;
}

function showLogin() {
    login.hidden = false;
    dashboard.hidden = true;
    logout.hidden = true;
}

async function showDashboard() {
    login.hidden = true;
    dashboard.hidden = false;
    logout.hidden = false;
    await loadLeads();
}

function addDetail(label, value) {
    if (value === '' || value == null) return;
    const term = document.createElement('dt');
    const detail = document.createElement('dd');
    term.textContent = label;
    detail.textContent = String(value);
    $('detail-fields').append(term, detail);
}

function showLead(lead) {
    $('detail-fields').replaceChildren();
    for (const [label, key] of [
        ['Received', 'receivedAt'], ['Reference', 'reference'], ['Type', 'enquiryType'],
        ['Service', 'service'], ['Name', 'name'], ['Business', 'company'],
        ['Email', 'email'], ['Phone', 'phone'], ['Contact preference', 'contactPreference'],
        ['Best time', 'bestTime'], ['Message', 'message'], ['Source', 'source']
    ]) addDetail(label, lead[key]);
    $('lead-detail').hidden = false;
    $('lead-detail').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function renderLeads() {
    const query = $('lead-filter').value.trim().toLowerCase();
    const filtered = leads.filter(lead => [lead.name, lead.email, lead.service, lead.message, lead.enquiryType]
        .some(value => String(value || '').toLowerCase().includes(query)));
    const list = $('lead-list');
    list.replaceChildren();
    if (!filtered.length) {
        const empty = document.createElement('p');
        empty.textContent = leads.length ? 'No visible records match this search.' : 'No enquiries have been saved yet.';
        list.append(empty);
        return;
    }
    for (const lead of filtered) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'lead-row';
        button.setAttribute('aria-label', `View ${lead.enquiryType || 'project'} enquiry from ${lead.name || 'visitor'}`);
        for (const value of [new Date(lead.receivedAt).toLocaleDateString(), lead.name, lead.service, lead.enquiryType]) {
            const span = document.createElement('span');
            span.textContent = value || '—';
            button.append(span);
        }
        button.addEventListener('click', () => showLead(lead));
        list.append(button);
    }
}

async function loadLeads() {
    message('Loading enquiries…');
    try {
        const data = await api('/api/admin-leads');
        leads = data.leads || [];
        $('lead-count').textContent = String(leads.length);
        $('project-count').textContent = String(leads.filter(lead => lead.enquiryType === 'project').length);
        $('call-count').textContent = String(leads.filter(lead => lead.enquiryType === 'call').length);
        $('testing-count').textContent = String(leads.filter(lead => lead.enquiryType === 'testing').length);
        $('list-note').textContent = `Showing the latest ${leads.length} saved records${data.moreThanShown ? ' (more exist in storage)' : ''}.`;
        renderLeads();
        message('Private records loaded.');
    } catch (error) {
        message(error.message);
        if (/sign-in/i.test(error.message)) showLogin();
    }
}

requestForm.addEventListener('submit', async event => {
    event.preventDefault();
    const button = requestForm.querySelector('button');
    button.disabled = true;
    message('Requesting a sign-in code…');
    try {
        const data = await api('/api/admin-auth', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'request', email: $('admin-email').value })
        });
        challengeId = data.challengeId;
        verifyForm.hidden = false;
        $('admin-code').focus();
        message(data.message);
    } catch (error) { message(error.message); }
    finally { button.disabled = false; }
});

verifyForm.addEventListener('submit', async event => {
    event.preventDefault();
    const button = verifyForm.querySelector('button');
    button.disabled = true;
    try {
        await api('/api/admin-auth', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'verify', email: $('admin-email').value, code: $('admin-code').value, challengeId })
        });
        $('admin-code').value = '';
        await showDashboard();
    } catch (error) { message(error.message); }
    finally { button.disabled = false; }
});

logout.addEventListener('click', async () => {
    try {
        await api('/api/admin-auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'logout' }) });
        leads = [];
        showLogin();
        message('Signed out.');
    } catch (error) {
        message(error.message);
    }
});
$('refresh').addEventListener('click', loadLeads);
$('lead-filter').addEventListener('input', renderLeads);

api('/api/admin-auth').then(showDashboard).catch(() => { showLogin(); message('Sign in with the studio mailbox to view private enquiries.'); });
