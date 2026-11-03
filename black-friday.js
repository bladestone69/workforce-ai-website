// Set to false to disable the 2026 website offer on every page immediately.
const BLACK_FRIDAY_ENABLED = true;

const johannesburgDate = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Johannesburg',
    year: 'numeric', month: '2-digit', day: '2-digit'
}).formatToParts(new Date());
const datePart = name => johannesburgDate.find(part => part.type === name)?.value || '';
const today = `${datePart('year')}-${datePart('month')}-${datePart('day')}`;

if (BLACK_FRIDAY_ENABLED && today >= '2026-11-01' && today <= '2026-11-30') {
    document.documentElement.classList.add('black-friday-active');
}
