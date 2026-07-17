const form = document.querySelector('#applicationForm');
const toast = document.querySelector('.toast');
const submitButton = form.querySelector('button[type="submit"]');
const successPanel = document.querySelector('#successPanel');
const ENDPOINT = 'https://script.google.com/macros/s/AKfycbxNs_z6SBzqMALmE6Ve3qnP-D4VelCrxbj4QaOT5I08ESX72jYFelQKDNNdYC2H674L5Q/exec';

const requiredFields = [
  { field: document.querySelector('#name'), error: document.querySelector('#nameError') },
  { field: document.querySelector('#email'), error: document.querySelector('#emailError') },
  { field: document.querySelector('#message'), error: document.querySelector('#messageError') },
  { field: document.querySelector('#consultationTitle'), error: document.querySelector('#consultationTitleError') },
  { field: document.querySelector('#pageCount'), error: document.querySelector('#pageCountError') },
];
const requiredGroups = [...document.querySelectorAll('[data-required-group]')];

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

function updateGroupState(group) {
  const checked = group.querySelectorAll('input[type="checkbox"]:checked').length > 0;
  const error = group.querySelector('.error-message');
  group.setAttribute('aria-invalid', String(!checked));
  if (error) error.classList.toggle('visible', !checked);
  return checked;
}

requiredGroups.forEach((group) => {
  group.addEventListener('change', () => updateGroupState(group));
});

function buildPayload(formData) {
  const payload = {};

  formData.forEach((value, key) => {
    if (payload[key]) {
      payload[key] = `${payload[key]}, ${value}`;
      return;
    }

    payload[key] = value;
  });

  return payload;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  window.setTimeout(() => toast.classList.remove('visible'), 4500);
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const allValid = requiredFields.map(({ field, error }) => updateFieldState(field, error)).every(Boolean);
  const allGroupsValid = requiredGroups.map((group) => updateGroupState(group)).every(Boolean);

  if (!allValid || !allGroupsValid) {
    requiredFields.find(({ field }) => !field.validity.valid)?.field.focus();
    if (allValid) requiredGroups.find((group) => group.getAttribute('aria-invalid') === 'true')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const formData = new FormData(form);
  const payload = buildPayload(formData);

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
