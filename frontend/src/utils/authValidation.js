export const emailPattern = /^[A-Za-z0-9]+(?:[._-][A-Za-z0-9]+)*@[A-Za-z0-9-]+\.com$/;

export function validateEmail(email) {
  if (!email.trim()) {
    return "Email is required.";
  }

  if (!emailPattern.test(email.trim())) {
    return "Enter a valid email with @ and .com and no spaces.";
  }

  return "";
}

export function getRequiredFieldError(label, value) {
  if (!value.trim()) {
    return `${label} is required.`;
  }

  return "";
}

export function validatePhone(phone) {
  if (!phone.trim()) {
    return "Phone is required.";
  }

  if (!/^\d{10}$/.test(phone.trim())) {
    return "Enter a correct 10-digit phone number.";
  }

  return "";
}
