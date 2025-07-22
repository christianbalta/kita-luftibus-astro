// registration-form.ts

interface FormElements extends HTMLFormControlsCollection {
  name: HTMLInputElement;
  vorname: HTMLInputElement;
  telefon: HTMLInputElement;
  email: HTMLInputElement;
  adresse: HTMLInputElement;
  'plz-ort': HTMLInputElement;
  beziehungsstatus: HTMLSelectElement;
  'geschlecht-kind1': HTMLSelectElement;
  'name-kind1': HTMLInputElement;
  'geburtsdatum-kind1': HTMLInputElement;
  'geschlecht-kind2': HTMLSelectElement;
  'name-kind2': HTMLInputElement;
  'geburtsdatum-kind2': HTMLInputElement;
  'anzahl-tage': HTMLInputElement;
  'eintritt-ab': HTMLInputElement;
  'subventionen-janein': RadioNodeList;
  datenschutz: HTMLInputElement;
  message: HTMLTextAreaElement;
}

interface RegistrationForm extends HTMLFormElement {
  readonly elements: FormElements;
}

interface RegistrationFormData {
  name: string;
  vorname: string;
  telefon: string;
  email: string;
  adresse: string;
  'plz-ort': string;
  beziehungsstatus: string;
  'geschlecht-kind1': string;
  'name-kind1': string;
  'geburtsdatum-kind1': string;
  'geschlecht-kind2'?: string;
  'name-kind2'?: string;
  'geburtsdatum-kind2'?: string;
  'anzahl-tage': string;
  'welche-tage': string[];
  message?: string;
  'eintritt-ab': string;
  'subventionen-janein': string;
  datenschutz: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

declare const gtag: (command: string, action: string, parameters: any) => void;

// Define required fields that backend expects
const REQUIRED_FIELDS = [
  'name', 'vorname', 'telefon', 'email', 'adresse', 'plz-ort',
  'beziehungsstatus', 'geschlecht-kind1', 'name-kind1', 'geburtsdatum-kind1',
  'anzahl-tage', 'eintritt-ab', 'subventionen-janein', 'datenschutz'
];

document.addEventListener('DOMContentLoaded', function(): void {
  const form = document.querySelector<RegistrationForm>('form[action="/verfuegbare-plaetze-und-anmeldung"]');

  if (!form) return;

  // Add ID to form for easier reference
  form.id = 'registration-form';

  // Create feedback elements
  const createFeedbackElements = (): { successDiv: HTMLDivElement; errorDiv: HTMLDivElement } => {
    // Success message
    const successDiv = document.createElement('div');
    successDiv.id = 'form-success';
    successDiv.className = 'hidden bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4';
    successDiv.innerHTML = `
      <strong class="font-bold">Vielen Dank!</strong>
      <span class="block sm:inline">Ihre Anmeldung wurde erfolgreich versendet. Wir werden Sie in Kürze kontaktieren.</span>
    `;

    // Error message
    const errorDiv = document.createElement('div');
    errorDiv.id = 'form-error';
    errorDiv.className = 'hidden bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4';
    errorDiv.innerHTML = `
      <strong class="font-bold">Fehler!</strong>
      <span class="block sm:inline" id="error-message">Beim Senden des Formulars ist ein Fehler aufgetreten.</span>
    `;

    // Insert before form
    form.parentNode!.insertBefore(successDiv, form);
    form.parentNode!.insertBefore(errorDiv, form);

    return { successDiv, errorDiv };
  };

  const { successDiv, errorDiv } = createFeedbackElements();

  // Add loading state to button
  const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const originalButtonText = submitButton.textContent || 'Senden';

  // Form validation
  const validateForm = (): string[] => {
    const errors: string[] = [];

    // Check required fields
    const requiredFields = form.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[required]');
    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        const label = form.querySelector<HTMLLabelElement>(`label[for="${field.id}"]`);
        const fieldName = label ? label.textContent!.replace(' *', '') : field.name;
        errors.push(`${fieldName} ist erforderlich`);
      }
    });

    // Check if at least one day is selected
    const checkedDays = form.querySelectorAll<HTMLInputElement>('input[name="welche-tage[]"]:checked');
    if (checkedDays.length === 0) {
      errors.push('Bitte wählen Sie mindestens einen Tag aus');
    }

    // Check if number of days matches selected days
    const anzahlTageElement = form.querySelector<HTMLInputElement>('#anzahl-tage')!;
    const anzahlTage = parseInt(anzahlTageElement.value);
    if (anzahlTage && checkedDays.length > 0 && anzahlTage !== checkedDays.length) {
      errors.push(`Die Anzahl der Tage (${anzahlTage}) stimmt nicht mit den ausgewählten Tagen (${checkedDays.length}) überein`);
    }

    // Check minimum 2 days requirement
    if (anzahlTage && anzahlTage < 2) {
      errors.push('Die Mindestanwesenheit beträgt 2 ganze Tage');
    }

    // Validate email format
    const emailElement = form.querySelector<HTMLInputElement>('#email')!;
    const email = emailElement.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      errors.push('Bitte geben Sie eine gültige E-Mail-Adresse ein');
    }

    // Validate phone number (Swiss format)
    const telefonElement = form.querySelector<HTMLInputElement>('#telefon')!;
    const telefon = telefonElement.value;
    const phoneRegex = /^(\+41|0041|0)?[1-9]\d{1,2}\s?\d{3}\s?\d{2}\s?\d{2}$/;
    if (telefon && !phoneRegex.test(telefon.replace(/\s/g, ''))) {
      errors.push('Bitte geben Sie eine gültige Telefonnummer ein');
    }

    // Check datenschutz checkbox
    const datenschutzCheckbox = form.querySelector<HTMLInputElement>('#datenschutz')!;
    if (!datenschutzCheckbox.checked) {
      errors.push('Bitte akzeptieren Sie die Datenschutzbestimmungen');
    }

    return errors;
  };

  // Handle form submission
  form.addEventListener('submit', async function(e: Event): Promise<void> {
    e.preventDefault();

    // Hide any previous messages
    successDiv.classList.add('hidden');
    errorDiv.classList.add('hidden');

    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      const errorMessageElement = document.getElementById('error-message')!;
      errorMessageElement.innerHTML = validationErrors.join('<br>');
      errorDiv.classList.remove('hidden');
      errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }

    // Show loading state
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="inline-block animate-spin mr-2">⏳</span> Wird gesendet...';

    // Collect form data
    const formData = new FormData(form);

    // Convert FormData to JSON using the explicit approach
    const data: RegistrationFormData = {
      name: formData.get('name') as string || '',
      vorname: formData.get('vorname') as string || '',
      telefon: formData.get('telefon') as string || '',
      email: formData.get('email') as string || '',
      adresse: formData.get('adresse') as string || '',
      'plz-ort': formData.get('plz-ort') as string || '',
      beziehungsstatus: formData.get('beziehungsstatus') as string || '',
      'geschlecht-kind1': formData.get('geschlecht-kind1') as string || '',
      'name-kind1': formData.get('name-kind1') as string || '',
      'geburtsdatum-kind1': formData.get('geburtsdatum-kind1') as string || '',
      'geschlecht-kind2': formData.get('geschlecht-kind2') as string || '',
      'name-kind2': formData.get('name-kind2') as string || '',
      'geburtsdatum-kind2': formData.get('geburtsdatum-kind2') as string || '',
      'anzahl-tage': formData.get('anzahl-tage') as string || '',
      'welche-tage': formData.getAll('welche-tage[]') as string[],
      message: formData.get('message') as string || '',
      'eintritt-ab': formData.get('eintritt-ab') as string || '',
      'subventionen-janein': formData.get('subventionen-janein') as string || '',
      datenschutz: formData.has('datenschutz') ? 'on' : 'off'
    };

    // Clean data but keep all required fields
    const cleanData: Partial<RegistrationFormData> = Object.entries(data).reduce((acc, [key, value]) => {
      // Always include required fields, even if empty (backend will validate)
      const isRequired = REQUIRED_FIELDS.includes(key);

      if (isRequired || (value !== '' && (Array.isArray(value) ? value.length > 0 : true))) {
        acc[key as keyof RegistrationFormData] = value as any;
      }
      return acc;
    }, {} as Partial<RegistrationFormData>);

    try {
      // Send to backend with credentials for CORS
      const response = await fetch('https://submission-luftibus.mosaic-dev.ch/verfuegbare-plaetze-und-anmeldung', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for CORS with different domains
        body: JSON.stringify(cleanData)
      });

      const result: ApiResponse = await response.json();

      if (response.ok && result.success) {
        // Success
        successDiv.classList.remove('hidden');
        form.style.display = 'none';
        successDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // Track conversion if analytics is available
        if (typeof gtag !== 'undefined') {
          gtag('event', 'form_submit', {
            'event_category': 'engagement',
            'event_label': 'registration_form'
          });
        }
      } else {
        // Error from server
        const errorMessage = result.error || 'Beim Senden des Formulars ist ein Fehler aufgetreten.';
        const errorMessageElement = document.getElementById('error-message')!;
        errorMessageElement.textContent = errorMessage;
        errorDiv.classList.remove('hidden');
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } catch (error) {
      // Network or other error
      console.error('Form submission error:', error);
      const errorMessageElement = document.getElementById('error-message')!;
      errorMessageElement.textContent = 'Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.';
      errorDiv.classList.remove('hidden');
      errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } finally {
      // Reset button state
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  });

  // Auto-update number of days based on selected checkboxes
  const dayCheckboxes = form.querySelectorAll<HTMLInputElement>('input[name="welche-tage[]"]');
  const anzahlTageInput = form.querySelector<HTMLInputElement>('#anzahl-tage')!;

  dayCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function(): void {
      const checkedCount = form.querySelectorAll<HTMLInputElement>('input[name="welche-tage[]"]:checked').length;
      if (checkedCount > 0) {
        anzahlTageInput.value = checkedCount.toString();
      }
    });
  });

  // Format phone number as user types
  const telefonInput = form.querySelector<HTMLInputElement>('#telefon');
  if (telefonInput) {
    telefonInput.addEventListener('input', function(e: Event): void {
      const target = e.target as HTMLInputElement;
      let value = target.value.replace(/\s/g, '');

      // Swiss phone number formatting
      if (value.startsWith('0')) {
        if (value.length > 3) value = value.slice(0, 3) + ' ' + value.slice(3);
        if (value.length > 7) value = value.slice(0, 7) + ' ' + value.slice(7);
        if (value.length > 10) value = value.slice(0, 10) + ' ' + value.slice(10);
        if (value.length > 13) value = value.slice(0, 13);
      }

      target.value = value;
    });
  }

  // Add asterisk explanation
  const asteriskNote = document.createElement('p');
  asteriskNote.className = 'text-sm text-gray-600 italic mb-4';
  asteriskNote.textContent = '* Pflichtfelder';
  form.insertBefore(asteriskNote, form.firstChild);
});