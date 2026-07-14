const form = document.querySelector('#applicationForm');
const toast = document.querySelector('.toast');
const submitButton = form.querySelector('button[type="submit"]');
const successPanel = document.querySelector('#successPanel');
const ENDPOINT = 'https://script.google.com/macros/s/AKfycbxNs_z6SBzqMALmE6Ve3qnP-D4VelCrxbj4QaOT5I08ESX72jYFelQKDNNdYC2H674L5Q/exec';

const requiredFields = [
  { field: document.querySelector('#name'), error: document.querySelector('#nameError') },
  { field: document.querySelector('#email'), error: document.querySelector('#emailError') },
  { field: document.querySelector('#message'), error: document.querySelector('#messageError') },
];

function updateFieldState(field, error) {
  const valid = field.validity.valid;
  field.setAttribute('aria-invalid', String(!valid));
  field.setAttribute('aria-describedby', error.id);
  error.classList.toggle('visible', !valid);
  return valid;
}

requiredFields.forEach(({ field, error }) => {
  field.addEventListener('blur', () => updateFieldState(field, error));
  field.addEventListener('input', () => {
    if (field.getAttribute('aria-invalid') === 'true') updateFieldState(field, error);
  });
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  window.setTimeout(() => toast.classList.remove('visible'), 4500);
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const allValid = requiredFields.map(({ field, error }) => updateFieldState(field, error)).every(Boolean);

  if (!allValid) {
    requiredFields.find(({ field }) => !field.validity.valid)?.field.focus();
    return;
  }

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  submitButton.disabled = true;
  submitButton.textContent = '送信しています…';

  try {
    await fetch(ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });

    form.reset();
    form.hidden = true;
    successPanel.hidden = false;
    successPanel.focus();
  } catch (error) {
    showToast('送信できませんでした。通信環境をご確認のうえ、もう一度お試しください。');
    submitButton.disabled = false;
    submitButton.textContent = '申し込み内容を送信';
  }
});
