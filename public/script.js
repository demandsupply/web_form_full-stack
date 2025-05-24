const form = document.getElementById("userForm");
const submitBtn = document.getElementById("submitBtn");
let validAge = false;


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