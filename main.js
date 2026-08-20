/* SummitDev — site behaviour. No framework, no build step. */
(function () {
  'use strict';

  /* ---------------------------------------------------------------------
     CONTACT CONFIG
     ---------------------------------------------------------------------
     Estimate requests are delivered by Web3Forms to SummitDevSupport@gmail.com.
     The access key below is tied to that address and is designed to be public
     (it has to ship in client-side code to work), so it is safe in the repo.

     To move delivery elsewhere: clear WEB3FORMS_KEY and set FORM_ENDPOINT to
     any endpoint that accepts a JSON POST — Formspree, Basin, Netlify Forms,
     or your own serverless route.

     With both empty the form falls back to opening the visitor's own mail
     client, pre-filled and addressed to CONTACT_EMAIL.
     --------------------------------------------------------------------- */
  var WEB3FORMS_KEY = 'a4e5dc5f-26d4-485c-899b-1d704ad2a326';  // issued to SummitDevSupport@gmail.com
  var FORM_ENDPOINT = '';
  var CONTACT_EMAIL = 'SummitDevSupport@gmail.com';

  /* --- Mobile drawer ---------------------------------------------------- */
  var burger = document.querySelector('.burger');
  var drawer = document.getElementById('drawer');

  if (burger && drawer) {
    burger.addEventListener('click', function () {
      var open = drawer.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
    });

    drawer.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        drawer.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });

    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
        drawer.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        burger.focus();
      }
    });
  }

  /* --- Footer year ------------------------------------------------------ */
  var year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  /* --- Estimate form ---------------------------------------------------- */
  var form = document.querySelector('[data-estimate-form]');
  if (!form) return;

  var status = form.querySelector('.form__status');
  var submit = form.querySelector('[type="submit"]');

  function fieldOf(input) { return input.closest('.field'); }

  function validate(input) {
    var wrap = fieldOf(input);
    if (!wrap) return true;
    var ok = input.checkValidity();
    wrap.classList.toggle('is-invalid', !ok);
    return ok;
  }

  form.querySelectorAll('input, textarea, select').forEach(function (input) {
    input.addEventListener('blur', function () {
      if (input.value !== '') validate(input);
    });
    input.addEventListener('input', function () {
      var wrap = fieldOf(input);
      if (wrap && wrap.classList.contains('is-invalid')) validate(input);
    });
  });

  function say(message) {
    if (!status) return;
    status.textContent = message;
    status.classList.add('is-shown');
  }

  function mailtoFallback(data) {
    var lines = [
      'Business: ' + (data.business || '—'),
      'Name: ' + (data.name || '—'),
      'Email: ' + (data.email || '—'),
      'Phone: ' + (data.phone || '—'),
      'City: ' + (data.city || '—'),
      'Service: ' + (data.service || '—'),
      'Current site: ' + (data.website || 'none'),
      'Timeline: ' + (data.timeline || '—'),
      '',
      'Project notes:',
      data.details || '—'
    ];
    var href = 'mailto:' + CONTACT_EMAIL +
      '?subject=' + encodeURIComponent('Estimate request — ' + (data.business || data.name || 'New inquiry')) +
      '&body=' + encodeURIComponent(lines.join('\n'));
    window.location.href = href;
    say('Your email app should be opening with the details filled in. If nothing happens, send them straight to ' + CONTACT_EMAIL + '.');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Honeypot: real people leave this empty.
    if (form.querySelector('[name="company_website_hp"]').value !== '') return;

    var inputs = Array.prototype.slice.call(form.querySelectorAll('input, textarea, select'));
    var valid = inputs.map(validate).every(Boolean);

    if (!valid) {
      var firstBad = form.querySelector('.field.is-invalid input, .field.is-invalid textarea, .field.is-invalid select');
      if (firstBad) firstBad.focus();
      say('A few fields still need attention — check the ones marked below.');
      return;
    }

    var data = {};
    new FormData(form).forEach(function (value, key) { data[key] = value; });
    delete data.company_website_hp;

    if (!WEB3FORMS_KEY && !FORM_ENDPOINT) { mailtoFallback(data); return; }

    // Web3Forms wants the access key in the payload and mails it to the
    // address the key was issued for. Everything else takes the raw fields.
    var url = WEB3FORMS_KEY ? 'https://api.web3forms.com/submit' : FORM_ENDPOINT;
    var payload = data;

    if (WEB3FORMS_KEY) {
      payload = {
        access_key: WEB3FORMS_KEY,
        subject: 'Estimate request — ' + (data.business || data.name || 'New inquiry'),
        from_name: 'SummitDev website',
        replyto: data.email
      };
      Object.keys(data).forEach(function (k) { payload[k] = data[k]; });
    }

    submit.disabled = true;
    var original = submit.textContent;
    submit.textContent = 'Sending…';

    fetch(url, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Request failed with status ' + res.status);
        form.reset();
        say('Got it. We read every inquiry ourselves and reply within one business day with next steps.');
      })
      .catch(function () {
        say('That did not go through. Email us directly at ' + CONTACT_EMAIL + ' and we will pick it up from there.');
      })
      .finally(function () {
        submit.disabled = false;
        submit.textContent = original;
      });
  });
})();
