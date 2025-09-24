// event-registration-form.ts

interface EventFormElements extends HTMLFormControlsCollection {
  name: HTMLInputElement;
  vorname: HTMLInputElement;
  telefon: HTMLInputElement;
  email: HTMLInputElement;
  event: HTMLSelectElement;
}

interface EventRegistrationForm extends HTMLFormElement {
  readonly elements: EventFormElements;
}

interface EventRegistrationData {
  name: string;
  vorname: string;
  telefon: string;
  email: string;
  event: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}


document.addEventListener('DOMContentLoaded', function (): void {
  const form = document.querySelector<EventRegistrationForm>('form[action="/events"]');
  if (!form) return;

  // Tag the form for reference
  form.id = 'event-registration-form';

  // Create feedback elements (success and error)
  const createFeedbackElements = () => {
    const successDiv = document.createElement('div');
    successDiv.id = 'event-form-success';
    successDiv.className = 'hidden bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4';
    successDiv.innerHTML = `
      <strong class="font-bold">Vielen Dank!</strong>
      <span class="block sm:inline">Ihre Event-Anmeldung wurde erfolgreich versendet. Wir melden uns bei Ihnen.</span>
    `;

    const errorDiv = document.createElement('div');
    errorDiv.id = 'event-form-error';
    errorDiv.className = 'hidden bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4';
    errorDiv.innerHTML = `
      <strong class="font-bold">Fehler!</strong>
      <span class="block sm:inline" id="event-error-message">Beim Senden des Formulars ist ein Fehler aufgetreten.</span>
    `;

    form.parentNode!.insertBefore(successDiv, form);
    form.parentNode!.insertBefore(errorDiv, form);

    return { successDiv, errorDiv };
  };

  const { successDiv, errorDiv } = createFeedbackElements();

  // Preselect event when clicking a "Jetzt anmelden" link
  const eventSelect = form.querySelector<HTMLSelectElement>('#event');
  const applyEventSelection = (value: string): void => {
    if (!eventSelect) return;
    eventSelect.value = value;
    eventSelect.dispatchEvent(new Event('change'));
  };

  document.querySelectorAll<HTMLAnchorElement>('a[href="#event-anmeldung"][data-event]').forEach(link => {
    link.addEventListener('click', () => {
      const val = link.getAttribute('data-event');
      if (val) {
        applyEventSelection(val);
        setTimeout(() => eventSelect?.focus(), 0);
      }
    });
  });

  // Button state
  const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const originalButtonText = submitButton?.textContent || 'Jetzt anmelden';

  // Validators
  const validateForm = (): string[] => {
    const errors: string[] = [];

    const name = (form.elements.name?.value || '').trim();
    const vorname = (form.elements.vorname?.value || '').trim();
    const telefon = (form.elements.telefon?.value || '').trim();
    const email = (form.elements.email?.value || '').trim();
    const eventSel = (form.elements.event?.value || '').trim();

    if (!name) errors.push('Name ist erforderlich');
    if (!vorname) errors.push('Vorname ist erforderlich');
    if (!telefon) errors.push('Telefon ist erforderlich');
    if (!email) errors.push('E-Mail-Adresse ist erforderlich');
    if (!eventSel) errors.push('Bitte einen Event auswählen');

    // Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      errors.push('Bitte geben Sie eine gültige E-Mail-Adresse ein');
    }

    // Swiss phone number validation (basic)
    const phoneRegex = /^(\+41|0041|0)?[1-9]\d{1,2}\s?\d{3}\s?\d{2}\s?\d{2}$/;
    if (telefon && !phoneRegex.test(telefon.replace(/\s/g, ''))) {
      errors.push('Bitte geben Sie eine gültige Telefonnummer ein');
    }

    return errors;
  };

  // Submit handler
  form.addEventListener('submit', async function (e: Event): Promise<void> {
    e.preventDefault();

    successDiv.classList.add('hidden');
    errorDiv.classList.add('hidden');

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      const errorMessageElement = document.getElementById('event-error-message')!;
      errorMessageElement.innerHTML = validationErrors.join('<br>');
      errorDiv.classList.remove('hidden');
      errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerHTML = '<span class="inline-block animate-spin mr-2">⏳</span> Wird gesendet...';
    }

    const formData = new FormData(form);
    const data: EventRegistrationData = {
      name: (formData.get('name') as string) || '',
      vorname: (formData.get('vorname') as string) || '',
      telefon: (formData.get('telefon') as string) || '',
      email: (formData.get('email') as string) || '',
      event: (formData.get('event') as string) || ''
    };

    try {
      const response = await fetch('https://submission-luftibus.mosaic-dev.ch/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data)
      });

      const result: ApiResponse = await response.json();

      if (response.ok && result.success) {
        successDiv.classList.remove('hidden');
        form.style.display = 'none';
        successDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        const g = (window as any).gtag as ((command: string, action: string, parameters: any) => void) | undefined;
        if (g) {
          g('event', 'form_submit', {
            event_category: 'engagement',
            event_label: 'event_registration_form'
          });
        }
      } else {
        const errorMessage = result.error || 'Beim Senden des Formulars ist ein Fehler aufgetreten.';
        const errorMessageElement = document.getElementById('event-error-message')!;
        errorMessageElement.textContent = errorMessage;
        errorDiv.classList.remove('hidden');
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } catch (err) {
      console.error('Event form submission error:', err);
      const errorMessageElement = document.getElementById('event-error-message')!;
      errorMessageElement.textContent = 'Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.';
      errorDiv.classList.remove('hidden');
      errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    }
  });

  // Optional: format phone number as user types (simple spacing for CH numbers)
  const telefonInput = form.querySelector<HTMLInputElement>('#telefon');
  if (telefonInput) {
    telefonInput.addEventListener('input', function (e: Event): void {
      const target = e.target as HTMLInputElement;
      let value = target.value.replace(/\s/g, '');

      if (value.startsWith('0')) {
        if (value.length > 3) value = value.slice(0, 3) + ' ' + value.slice(3);
        if (value.length > 7) value = value.slice(0, 7) + ' ' + value.slice(7);
        if (value.length > 10) value = value.slice(0, 10) + ' ' + value.slice(10);
        if (value.length > 13) value = value.slice(0, 13);
      }

      target.value = value;
    });
  }

  // Add asterisk note if not already present
  const firstGroup = form.querySelector('.bg-background-cream');
  if (firstGroup) {
    const note = document.createElement('p');
    note.className = 'text-sm text-gray-600 italic mb-4';
    note.textContent = '* Pflichtfelder';
    firstGroup.parentElement?.insertBefore(note, firstGroup);
  }
});
