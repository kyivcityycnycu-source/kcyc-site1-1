/**
 * КММР: Google Form → Firestore (саме ФОРМА, не таблиця)
 *
 * Відкрито з: Форма → ⋮ → Редактор скриптів
 * Тригер: onFormSubmit | З форми | Під час надсилання форми
 */

var FIREBASE_API_KEY = 'AIzaSyBj0ID56YOMTEhvcTD1tdieDqSqjwqfw1w';
var FIREBASE_PROJECT_ID = 'kcyc-site-b9544';

function onFormSubmit(e) {
  try {
    if (!e || !e.response) {
      throw new Error('Немає e.response — тригер має бути «З форми / Під час надсилання»');
    }

    var itemResponses = e.response.getItemResponses();
    var answers = {};
    var name = '';
    var email = '';
    var phone = '';

    for (var i = 0; i < itemResponses.length; i++) {
      var item = itemResponses[i];
      var title = String(item.getItem().getTitle() || '').trim();
      var value = normalizeAnswer_(item.getResponse());
      if (!title || !value) continue;

      answers[title] = value;

      var t = title.toLowerCase();
      if (!name && (t.indexOf('ім') !== -1 || t.indexOf('прізвищ') !== -1 || t.indexOf('name') !== -1 || t.indexOf('піб') !== -1 || t.indexOf('фio') !== -1)) {
        name = value;
      }
      if (!email && (t.indexOf('email') !== -1 || t.indexOf('e-mail') !== -1 || t.indexOf('пошта') !== -1)) {
        email = value;
      }
      if (!phone && (t.indexOf('телефон') !== -1 || t.indexOf('phone') !== -1 || t.indexOf('номер') !== -1 || t.indexOf('моб') !== -1)) {
        phone = value;
      }
    }

    // Email з налаштування форми «Збирати адреси електронної пошти»
    try {
      var respondentEmail = e.response.getRespondentEmail();
      if (respondentEmail && !email) email = respondentEmail;
    } catch (ignore) {}

    if (!name) {
      var keys = Object.keys(answers);
      name = keys.length ? answers[keys[0]] : 'Учасник (Google Form)';
    }

    // formType: general_contact — видно в ЖИВІЙ адмінці («Заявки в команду») без деплою.
    // Після деплою можна змінити на participant_google_form → вкладка «Учасники».
    var idToken = getFirebaseIdToken_();
    writeSubmission_(idToken, {
      formType: 'general_contact',
      source: 'google_form',
      status: 'new',
      name: name,
      email: email || '',
      phone: phone || '',
      department: 'Учасник · Google Form',
      motivation: answers['Твоя мотивація стати частиною КММР'] || answers['Твоя мотивація стати частиною КММР:'] || '',
      socialTag: answers['Тег за яким тебе можна знайти у Telegram'] || answers['Тег за яким тебе можна знайти у Telegram:'] || '',
      answers: answers
    });
  } catch (err) {
    console.error('KMMR form sync error:', err);
    throw err;
  }
}

/** Тест без заповнення форми: Запустити → testPing */
function testPing() {
  var idToken = getFirebaseIdToken_();
  writeSubmission_(idToken, {
    formType: 'general_contact',
    source: 'google_form_test',
    status: 'new',
    name: 'ТЕСТ з Apps Script',
    email: 'test@example.com',
    phone: '+380000000000',
    department: 'Учасник · Google Form',
    motivation: '',
    socialTag: '',
    answers: { 'Перевірка': 'Якщо бачите це — звʼязок працює' }
  });
}

function normalizeAnswer_(response) {
  if (response === null || response === undefined) return '';
  if (Object.prototype.toString.call(response) === '[object Array]') {
    return response.join(', ').trim();
  }
  return String(response).trim();
}

function getFirebaseIdToken_() {
  var url = 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + FIREBASE_API_KEY;
  var res = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ returnSecureToken: true }),
    muteHttpExceptions: true
  });
  var body = JSON.parse(res.getContentText());
  if (res.getResponseCode() >= 300 || !body.idToken) {
    throw new Error('Firebase Auth failed: ' + res.getContentText());
  }
  return body.idToken;
}

function writeSubmission_(idToken, data) {
  var url =
    'https://firestore.googleapis.com/v1/projects/' +
    FIREBASE_PROJECT_ID +
    '/databases/(default)/documents/submissions';

  var fields = {
    formType: { stringValue: data.formType },
    source: { stringValue: data.source },
    status: { stringValue: data.status },
    name: { stringValue: data.name },
    email: { stringValue: data.email },
    phone: { stringValue: data.phone },
    department: { stringValue: data.department || 'Учасник · Google Form' },
    motivation: { stringValue: data.motivation || '' },
    socialTag: { stringValue: data.socialTag || '' },
    createdAt: { timestampValue: new Date().toISOString() },
    answers: { mapValue: { fields: toFirestoreMap_(data.answers) } }
  };

  var res = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + idToken },
    payload: JSON.stringify({ fields: fields }),
    muteHttpExceptions: true
  });

  if (res.getResponseCode() >= 300) {
    throw new Error('Firestore write failed: ' + res.getContentText());
  }
}

function toFirestoreMap_(obj) {
  var out = {};
  Object.keys(obj || {}).forEach(function (key) {
    out[key] = { stringValue: String(obj[key]) };
  });
  return out;
}
