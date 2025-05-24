const form = document.getElementById("userForm");
const submitBtn = document.getElementById("submitBtn");


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