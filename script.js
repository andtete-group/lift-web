const form = document.querySelector('#applicationForm');
const toast = document.querySelector('.toast');
const submitButton = form.querySelector('button[type="submit"]');
const successPanel = document.querySelector('#successPanel');
const ENDPOINT = 'https://script.google.com/macros/s/AKfycbxNs_z6SBzqMALmE6Ve3qnP-D4VelCrxbj4QaOT5I08ESX72jYFelQKDNNdYC2H674L5Q/exec';
const estimatePrice = document.querySelector('#estimatePrice');
const estimateSuffix = document.querySelector('#estimateSuffix');
const estimateBreakdown = document.querySelector('#estimateBreakdown');
const estimatedPriceInput = document.querySelector('#estimatedPriceInput');

const estimateConfig = {
  basePrice: 250000,
  maxPrice: 500000,
  includedPages: 3,
  pageUnitPrice: 25000,
  prices: {
    requestType: {
      リニューアル: 30000,
      運用情報更新: 10000,
      その他: 30000,
    },
    sitePurpose: {
      通販ネットショップ: 100000,
      メディア: 80000,
      採用・求人ランディングページ: 50000,
      プロモーション: 50000,
      ブログ・ニュース: 50000,
      アフィリエイト: 50000,
      掲示板・口コミ: 80000,
      その他: 30000,
    },
    requiredPages: {
      採用情報: 25000,
      商品紹介: 25000,
      決済: 70000,
      検索機能: 50000,
      その他: 25000,
    },
    liftWebTasks: {
      企画: 20000,
      "文章作成・用意": 40000,
      "イラスト作成・用意": 30000,
      サーバー手配: 20000,
      "CMS・WordPressの導入": 80000,
      SEO対策: 30000,
      "ロゴの作成・用意": 40000,
      "写真撮影・用意": 30000,
      ドメイン取得: 20000,
      その他: 30000,
    },
  },
};

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

function formatYen(value) {
  return value.toLocaleString('ja-JP');
}

function getCheckedValues(name) {
  return [...form.querySelectorAll(`input[name="${name}"]:checked`)].map((input) => input.value);
}

function buildEstimate() {
  if (!estimatePrice || !estimateBreakdown) return;

  const lineItems = [{ label: '基本制作プラン', price: estimateConfig.basePrice }];
  const pageCount = Number(document.querySelector('#pageCount')?.value || 0);
  const extraPages = Math.max(0, pageCount - estimateConfig.includedPages);

  if (extraPages > 0) {
    lineItems.push({ label: `追加ページ ${extraPages}ページ`, price: extraPages * estimateConfig.pageUnitPrice });
  }

  Object.entries(estimateConfig.prices).forEach(([groupName, prices]) => {
    getCheckedValues(groupName).forEach((value) => {
      const price = prices[value] || 0;
      if (price > 0) lineItems.push({ label: value, price });
    });
  });

  const rawTotal = lineItems.reduce((sum, item) => sum + item.price, 0);
  const total = Math.min(rawTotal, estimateConfig.maxPrice);
  estimatePrice.textContent = formatYen(total);
  if (estimateSuffix) estimateSuffix.textContent = rawTotal > estimateConfig.maxPrice ? '円' : '円〜';
  if (estimatedPriceInput) estimatedPriceInput.value = `${formatYen(total)}円`;

  estimateBreakdown.innerHTML = '';
  lineItems.slice(0, 6).forEach((item) => {
    const li = document.createElement('li');
    const prefix = item.label === '基本制作プラン' ? '' : '+';
    li.innerHTML = `<span>${item.label}</span><span>${prefix}${formatYen(item.price)}円</span>`;
    estimateBreakdown.append(li);
  });

  if (lineItems.length > 6) {
    const li = document.createElement('li');
    li.innerHTML = `<span>その他選択項目</span><span>概算に反映済み</span>`;
    estimateBreakdown.append(li);
  }

  if (rawTotal > estimateConfig.maxPrice) {
    const li = document.createElement('li');
    li.innerHTML = `<span>上限調整</span><span>${formatYen(estimateConfig.maxPrice)}円で固定</span>`;
    estimateBreakdown.append(li);
  }
}

if (estimatePrice && estimateBreakdown) {
  form.addEventListener('input', buildEstimate);
  form.addEventListener('change', buildEstimate);
  buildEstimate();
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
