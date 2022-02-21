const initialStatus = {
  isClosed: false,
  isAccepted: false,
  isRejected: false,
};
let inputValue = '';
const btn = document.getElementById('FIU-widget-submit');
const input = document.getElementById('FIU-widget-input-id');
let msg = '';
window.addEventListener(
  'message',
  function (e) {
    const { status, text = '' } = e.data || {};
    if (status === 'ACCEPTED') {
      initialStatus.isAccepted = true;
      if (text) {
        msg += text;
      }
    }
    if (status === 'REJECTED') {
      initialStatus.isRejected = true;
    }
  },
  false
);

function handleChange(e) {
  const { value } = e.target || {};
  inputValue = value;
}

async function apiCall(args = {}) {
  const { options, URL } = args;
  try {
    const response = await fetch(URL, options);
    return response;
  } catch (e) {
    console.log(e);
  }
}

async function getRedirectionURL(args = {}) {
  const { token, sessionId, aaID } = args || {};
  const URL = 'https://uatapp.finduit.in/api/FIU/RedirectAA';
  const body = {
    clienttrnxid: '097c78d5-c0b4-425b-9207-f36831f3117b',
    fiuID: 'STERLING-FIU-UAT',
    userId: 'jeyalakshmanang@sterlingsoftware.co.in',
    aaCustomerHandleId: `${aaID}@CAMSAA`,
    aaCustomerMobile: aaID,
    sessionId,
    // useCaseid: '1',
  };
  const options = {
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(body),
  };
  const result = await apiCall({ URL, options });
  const { redirectionurl } = await result.json();
  if (redirectionurl) {
    const width = (window.innerWidth * 2) / 3;
    const height = (window.innerHeight * 2) / 3;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    const newWindow = window.open(
      redirectionurl,
      '_blank',
      `width=390,height=844,top=${top},left=${left},location=yes,scrollbars=yes, status=yes`
    );
    const interval = setInterval(() => {
      if (newWindow.closed) {
        // alert("window has closed");
        initialStatus.isClosed = true;
        clearInterval(interval);
      }
    }, 1000);
  }
}

input.addEventListener('change', handleChange);

async function WidgetSubmit() {
  btn.innerText = 'Waiting for the Consent...';
  btn.disabled = true;
  btn.style.opacity = '0.5';
  const body = {
    fiuID: 'STERLING-FIU-UAT',
    redirection_key: 'DSTKnxbUAlPukv',
    userId: 'jeyalakshmanang@sterlingsoftware.co.in',
  };
  const URL = 'https://uatapp.finduit.in/api/FIU/Authentication';
  const options = {
    headers: {
      'Content-Type': 'application/json ',
    },
    method: 'POST',
    body: JSON.stringify(body),
  };
  const result = await apiCall({ URL, options });
  const { token, sessionId } = await result.json();
  if (token && sessionId) {
    getRedirectionURL({ token, sessionId, aaID: inputValue });
  }
}

const interval = setInterval(() => {
  if (initialStatus.isAccepted && initialStatus.isClosed && !initialStatus.isRejected) {
    if (msg) {
      alert(msg);
    } else {
      alert('Consent is Accepted');
    }
    btn.innerText = 'Provide Consent';
    btn.disabled = false;
    btn.style.opacity = '1';
    clearInterval(interval);
  }
  if (!initialStatus.isAccepted && initialStatus.isClosed && initialStatus.isRejected) {
    alert('Consent is Rejected');
    btn.innerText = 'Provide Consent';
    btn.disabled = false;
    btn.style.opacity = '1';
    clearInterval(interval);
  }
  if (!initialStatus.isAccepted && initialStatus.isClosed && !initialStatus.isRejected) {
    alert('Window is closed by user');
    btn.innerText = 'Provide Consent';
    btn.disabled = false;
    btn.style.opacity = '1';
    clearInterval(interval);
  }
}, 1000);
