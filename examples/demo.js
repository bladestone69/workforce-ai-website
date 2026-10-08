const buttons = document.querySelectorAll('[data-demo-view]');
const versions = document.querySelectorAll('[data-demo-version]');
function setView(view) {
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.demoView === view)));
    versions.forEach(version => { version.hidden = version.dataset.demoVersion !== view; });
}
buttons.forEach(button => button.addEventListener('click', () => setView(button.dataset.demoView)));
setView('after');
