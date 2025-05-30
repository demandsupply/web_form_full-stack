const form = document.getElementById("userForm");
const submitBtn = document.getElementById("submitBtn");
const popupMessage = document.getElementById("popup");
const overlay = document.getElementById("overlay");
const btnOk = document.getElementById("btnOk");
let validAge = false;
let provinciaScelta;

// un oggetto campi che contengono le regex per validare i campi
const campi = {
  nome: { regex: /^[a-zA-Zàèéìòù' ]{2,30}$/ },
  cognome: { regex: /^[a-zA-Zàèéìòù' ]{2,30}$/ },
  indirizzo: { regex: /^[\w\s.,àèéìòù-]{5,50}$/ },
  cf: {
    // $/i  ingnore case
    regex: /^[A-Z]{6}[0-9]{2}[A-EHLMPR-T][0-9]{2}[A-Z][0-9]{3}[A-Z]$/i,
  },
  nascita: { regex: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/ },
  cellulare: { regex: /^\d{10}$/ },
  email: { regex: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/ },
};

function sanitize(input) {
  return input.replace(/<[^>]*>/g, "").trim();
}

function validateCampo(id) {
  const input = document.getElementById(id);
  const cleanedValue = sanitize(input.value);
  // const regex = campi[id].regex;
  const { regex } = campi[id];

  if (!regex.test(cleanedValue)) {
    input.classList.add("is-invalid");
    input.classList.remove("is-valid");
    return false;
  } else {
    input.classList.remove("is-invalid");
    input.classList.add("is-valid");
    return true;
  }
}

// controlla che non sia stata inserita una data futura
function validateDate(selectedDate, now) {
  console.log(`selected date is ${selectedDate} and current date is ${now}`);
  if (selectedDate > now) {
    return false;
  }
  return true;
}

// controlla che l'utente sia maggiorenne
function validateAge(birthDate, now) {
  let age = now.split("-")[0] - birthDate.split("-")[0];
  let monthDiff = now.split("-")[1] - birthDate.split("-")[1];
  let dayDiff = now.split("-")[2] - birthDate.split("-")[2];
  console.log(`age is ${age} month diff ${monthDiff} day diff ${dayDiff}`);

  if (age >= 19) {
    console.log("major 19");
    return true;
  } else if (
    (age === 18 && monthDiff > 0) ||
    (age === 18 && monthDiff === 0 && dayDiff >= 0)
  ) {
    console.log("major 18");
    return true;
  } else {
    console.log("minor");
    return false;
  }
}

const selectedDate = document.getElementById("nascita");
// controlla la validità della data inserita; se non è valida mostra un messaggio d'errore specifico
function checkAge() {
  const dateFeedback = document.getElementById("dateFeedback");
  const birthDate = selectedDate.value;
  const now = new Date().toISOString().split("T")[0];
  console.log(birthDate);

  if (!validateDate(birthDate, now)) {
    selectedDate.classList.add("is-invalid");
    selectedDate.classList.remove("is-valid");
    dateFeedback.textContent = "Inserisci una data valida (precedente a oggi).";
    validAge = false;
    return;
  }

  if (!validateAge(birthDate, now)) {
    selectedDate.classList.add("is-invalid");
    selectedDate.classList.remove("is-valid");
    dateFeedback.textContent =
      "L'iscrizione è possibile solo per i maggiorenni.";
    validAge = false;
    return;
  }

  selectedDate.classList.remove("is-invalid");
  selectedDate.classList.add("is-valid");
  dateFeedback.textContent = "";
  validAge = true;
}
selectedDate.addEventListener("change", checkAge);

function validateProvincia() {
  const select = document.getElementById("provincia");
  if (!select.value) {
    select.classList.add("is-invalid");
    select.classList.remove("is-valid");
    return false;
  } else {
    select.classList.remove("is-invalid");
    select.classList.add("is-valid");
    provinciaScelta = select.value;
    return provinciaScelta;
  }
}
function validateComune() {
  const select = document.getElementById("comune");
  if (!select.value) {
    select.classList.add("is-invalid");
    select.classList.remove("is-valid");
    return false;
  } else {
    select.classList.remove("is-invalid");
    select.classList.add("is-valid");
    return true;
  }
}

// Popola la select province da JSON esterno
fetch("comuni.json")
  .then((response) => response.json())
  .then((province) => {
    const select = document.getElementById("provincia");
    const regioni = province.regioni;
    const arrayProvince = [];

    for (let regione of regioni) {
      for (let provincia of regione.province) {
        arrayProvince.push({
          nome: provincia.nome,
          sigla: provincia.code,
        });
      }
    }

    // ordina le province in ordine alfabetico
    arrayProvince.sort((a, b) => a.nome.localeCompare(b.nome));

    arrayProvince.forEach((provincia) => {
      const option = document.createElement("option");
      option.value = provincia.sigla;
      option.textContent = `${provincia.nome} (${provincia.sigla})`;
      select.appendChild(option);
    });
  })
  .catch((error) => {
    console.error("Errore nel caricamento province:", error);
  });

// popola la select comuni in base alla provincia selezionata
function caricaComuni(provinciaScelta) {
  fetch("comuni.json")
    .then((response) => response.json())
    .then((comuniJson) => {
      const select = document.getElementById("comune");

      // pulisci la lista dei comuni ogni volta che viene selezionata una nuova provincia
      select.innerHTML = "";

      const regioni = comuniJson.regioni;

      for (let regione of regioni) {
        for (let provincia of regione.province) {
          if (provincia.code === provinciaScelta) {
            console.log("provincia " + provincia.code + " trovata");
            const selezionaCom = document.createElement("option");
            selezionaCom.value = "";
            selezionaCom.textContent = "seleziona il comune";
            select.appendChild(selezionaCom);

            for (let comune of provincia.comuni) {
              const option = document.createElement("option");
              option.value = comune.nome;
              option.textContent = comune.nome;
              select.appendChild(option);
            }

            return;
          }
        }
      }
    })

    .catch((error) => {
      console.error("Errore nel caricamento province:", error);
    });
}


function checkFormValid() {
  const validCampi = Object.keys(campi).every((id) => validateCampo(id));
  const validProv = validateProvincia();
  const validCom = validateComune();

  submitBtn.disabled = !(validCampi && validProv && validCom && validAge);
}

Object.keys(campi).forEach((id) => {
  const input = document.getElementById(id);
  if (input === "nascita") {
    input.addEventListener("change", checkAge);
  } else {
    input.addEventListener("input", () => {
      validateCampo(id);
      checkFormValid();
    });
  }
});

document.getElementById("provincia").addEventListener("change", () => {
  if (validateProvincia()) {
    caricaComuni(provinciaScelta);
  }
  checkFormValid();
});

document.getElementById("comune").addEventListener("change", () => {
  validateComune();
  checkFormValid();
});

// resetta tutti i campi del form e ripristina variabili di controllo al valore originale
function resetForm() {
  form.reset();
  validAge = false;
  submitBtn.disabled = true;

  document
    .querySelectorAll(".is-valid, .is-invalid")
    .forEach((el) => el.classList.remove("is-valid", "is-invalid"));

  popupMessage.style.display = "none";
  overlay.style.display = "none";
}


form.addEventListener("submit", function (e) {
  e.preventDefault();

  // crea oggetto contenente i dati del form da inviare al server
  const formData = {};
  Object.keys(campi).forEach((id) => {
    const input = document.getElementById(id);
    input.value = sanitize(input.value);
    formData[id] = document.getElementById(id).value;
  });
  formData["provincia"] = document.getElementById("provincia").value;
  formData["comune"] = document.getElementById("comune").value;

  console.log(formData);

  // invia l'oggetto al server
  fetch("/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("risposta server", data);
      // alert("dati inviati con successo!");
    })
    .catch((err) => console.error("errore: ", err));

  popupMessage.style.display = "block";
  overlay.style.display = "block";
});

btnOk.addEventListener("click", resetForm);