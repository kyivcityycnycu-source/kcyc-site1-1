import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { assertFormAllowed, FormSpamError, isFormSpamError } from "../lib/formGuard";

export interface ContactFormData {
  name: string;
  phone: string;
  email: string;
  socialTag?: string;
  department: string;
  motivation: string;
}

export interface SupportFormData {
  orgName: string;
  repName: string;
  phone: string;
  email: string;
  commTag?: string;
  orgSocial?: string;
  eventStartDate?: string;
  eventEndDate?: string;
  projectTitle: string;
  description: string;
  supportType: string;
}

export interface ApplicationFormData {
  name: string;
  phone: string;
  email: string;
  opportunityId: string;
  opportunityTitle: string;
  type: string;
  answers: Record<string, string>;
  socialLink?: string;
}

/** Anti-spam metadata from the UI (never stored in Firestore). */
export interface FormGuardMeta {
  honeypot?: string;
  openedAt: number;
}

export { FormSpamError, isFormSpamError };

const deepClean = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(v => deepClean(v));
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const value = obj[key];
      if (value !== undefined) {
        acc[key] = deepClean(value);
      } else {
        acc[key] = "";
      }
      return acc;
    }, {} as any);
  }
  return obj;
};

/** Returns true if we should pretend success (honeypot) without writing. */
const runGuard = (formKey: string, meta?: FormGuardMeta): boolean => {
  try {
    assertFormAllowed({
      formKey,
      honeypot: meta?.honeypot ?? '',
      openedAt: meta?.openedAt ?? 0,
    });
    return false;
  } catch (error) {
    if (isFormSpamError(error) && error.code === 'honeypot') {
      return true; // silent fake success
    }
    throw error;
  }
};

export const submitContactForm = async (
  data: ContactFormData,
  meta?: FormGuardMeta
): Promise<{ success: boolean; message: string }> => {
  try {
    if (runGuard('contact', meta)) {
      return { success: true, message: 'Дякуємо! Ваша заявка успішно відправлена.' };
    }

    const cleanedPayload = deepClean(data);
    await addDoc(collection(db, "submissions"), {
      ...cleanedPayload,
      formType: 'general_contact',
      status: 'new',
      createdAt: serverTimestamp()
    });

    return {
      success: true,
      message: 'Дякуємо! Ваша заявка успішно відправлена.'
    };
  } catch (error) {
    console.error("Error adding document: ", error);
    throw error;
  }
};

export const submitSupportForm = async (
  data: SupportFormData,
  meta?: FormGuardMeta
): Promise<{ success: boolean; message: string }> => {
  try {
    if (runGuard('support', meta)) {
      return { success: true, message: 'Дякуємо! Ваша ініціатива успішно відправлена.' };
    }

    const cleanedPayload = deepClean(data);
    await addDoc(collection(db, "submissions"), {
      ...cleanedPayload,
      formType: 'initiative_support',
      status: 'new',
      createdAt: serverTimestamp()
    });

    return {
      success: true,
      message: 'Дякуємо! Ваша ініціатива успішно відправлена.'
    };
  } catch (error) {
    console.error("Error adding support request: ", error);
    throw error;
  }
};

export const submitApplicationForm = async (
  data: ApplicationFormData,
  meta?: FormGuardMeta
): Promise<{ success: boolean; message: string }> => {
  try {
    if (runGuard('opportunity', meta)) {
      return { success: true, message: 'Заявка успішно відправлена!' };
    }

    const cleanedPayload = deepClean(data);
    await addDoc(collection(db, "submissions"), {
      ...cleanedPayload,
      formType: 'opportunity_application',
      status: 'new',
      createdAt: serverTimestamp()
    });

    return {
      success: true,
      message: 'Заявка успішно відправлена!'
    };
  } catch (error) {
    console.error("Error adding application: ", error);
    throw error;
  }
};

export const subscribeToNewsletter = async (
  email: string,
  meta?: FormGuardMeta
): Promise<{ success: boolean; message: string }> => {
  try {
    if (runGuard('newsletter', meta)) {
      return { success: true, message: 'Ви успішно підписалися!' };
    }

    await addDoc(collection(db, "submissions"), {
      email,
      formType: 'newsletter',
      createdAt: serverTimestamp()
    });
    return { success: true, message: 'Ви успішно підписалися!' };
  } catch (error) {
    console.error("Error subscribing:", error);
    throw error;
  }
};
