import "./bootstrap-custom.scss";

import "bootstrap";

import "../vendor/wasm_exec.js";
import ageWasmUrl from "../vendor/age.wasm?url";
const go = new Go();
WebAssembly.instantiateStreaming(fetch(ageWasmUrl), go.importObject).then(
  (result) => {
    go.run(result.instance);
  },
);

const alert = (alertPlaceholder, message, type) => {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = [
    `<div class="alert alert-${type} alert-dismissible" role="alert">`,
    `   <div>${message}</div>`,
    '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
    "</div>",
  ].join("");

  alertPlaceholder.append(wrapper);
};

const downloadURL = (data, fileName) => {
  const a = document.createElement("a");
  a.href = data;
  a.download = fileName;
  document.body.appendChild(a);
  a.style.display = "none";
  a.click();
  a.remove();
};

const downloadBlob = (data, fileName) => {
  const blob = new Blob([data], {
    type: "application/octet-stream",
  });
  const url = window.URL.createObjectURL(blob);
  downloadURL(url, fileName);
  setTimeout(() => window.URL.revokeObjectURL(url), 1000);
};

const showWorking = (element) => {
  element.classList.add("disabled");
  if (element.firstElementChild) {
    element.firstElementChild.removeAttribute("hidden");
  }
};

const hideWorking = (element) => {
  element.classList.remove("disabled");
  if (element.firstElementChild) {
    element.firstElementChild.setAttribute("hidden", true);
  }
};

let clearKeysTimeout;

// Clears the key fields and variables
function clearKeys() {
  const pubkey = document.getElementById("pubkey");
  const privkey = document.getElementById("privkey");

  if (pubkey) pubkey.value = "";
  if (privkey) privkey.value = "";

  console.log("Keys cleared due to inactivity.");
}

// Resets the timer whenever the user interacts with the page
function resetKeyTimer() {
  clearTimeout(clearKeysTimeout);
  clearKeysTimeout = setTimeout(clearKeys, 10000); // 60 seconds
}

// Attach the activity listeners
["mousemove", "keydown", "mousedown", "touchstart"].forEach((event) => {
  document.addEventListener(event, resetKeyTimer);
});

document
  .getElementById("generateKeysForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    let pubkey = document.getElementById("pubkey");
    let privkey = document.getElementById("privkey");
    const keys = generateX25519Identity();
    pubkey.value = keys.publicKey;
    privkey.value = keys.privateKey;

    resetKeyTimer(); // Start/reset the auto-clear countdown after generation
  });

document.getElementById("encryptForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const recipients = document.getElementById("recipients").value;
  const message = document.getElementById("message").value;
  let output = document.getElementById("encryptedOutput");
  output.value = "";

  const result = encrypt(recipients, message);

  if (result.error) {
    alert(document.getElementById("errorEncrypt"), result.error, "danger");
  } else {
    output.value = result.output;
  }
});

document
  .getElementById("encryptBinaryForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const recipients = document.getElementById("recipients-binary").value;
    const file = document.getElementById("filesEncrypt");
    if (file.files.length == 0) {
      alert(
        document.getElementById("errorEncryptBinary"),
        "Please select a file",
        "danger",
      );
      return;
    }
    for (const f of file.files) {
      console.log(`Processing ${f.name}...`);
      showWorking(e.submitter);
      const reader = new FileReader();
      reader.onload = function () {
        const buffer = new Uint8Array(reader.result);
        const result = encryptBinary(recipients, buffer);
        if (typeof result === "string") {
          alert(
            document.getElementById("errorEncryptBinary"),
            result,
            "danger",
          );
        } else {
          const fileName = f.name + ".age";
          console.log(`Encrypted ${fileName}`);
          downloadBlob(result, `${fileName}`);
        }
        hideWorking(e.submitter);
      };
      reader.readAsArrayBuffer(f);
    }
  });

document.getElementById("decryptForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const identities = document.getElementById("identities").value;
  const encryptedText = document.getElementById("encryptedText").value;
  let output = document.getElementById("decryptedOutput");
  output.value = "";

  const result = decrypt(identities, encryptedText);
  if (result.error) {
    alert(document.getElementById("errorDecrypt"), result.error, "danger");
  } else {
    output.value = result.output;
  }
});

document
  .getElementById("decryptBinaryForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const identities = document.getElementById("identities-binary").value;
    const file = document.getElementById("filesDecrypt");
    if (file.files.length == 0) {
      alert(
        document.getElementById("errorDecryptBinary"),
        "Please select a file",
        "danger",
      );
      return;
    }
    for (const f of file.files) {
      console.log(`Processing ${f.name}...`);
      const reader = new FileReader();
      reader.onload = function () {
        showWorking(e.submitter);

        const buffer = new Uint8Array(reader.result);
        const result = decryptBinary(identities, buffer);
        if (typeof result === "string") {
          alert(
            document.getElementById("errorDecryptBinary"),
            result,
            "danger",
          );
          return;
        } else {
          const fileName = f.name.replace(".age", "");
          console.log(`Decrypted ${fileName}`);
          downloadBlob(result, `${fileName}`);
        }
        hideWorking(e.submitter);
      };
      reader.readAsArrayBuffer(f);
    }
  });
