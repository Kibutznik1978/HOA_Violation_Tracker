import { httpsCallable } from 'firebase/functions';
import { getFunctions } from 'firebase/functions';
import { Violation, HOA } from '../types';

const functions = getFunctions();

export interface EmailNotificationData {
  violation: Violation;
  hoa: HOA;
}

export const sendViolationNotification = async (data: EmailNotificationData) => {
  try {
    const sendNotification = httpsCallable(functions, 'sendViolationNotification');
    const result = await sendNotification(data);
    return result.data;
  } catch (error) {
    console.error('Error sending email notification:', error);
    throw error;
  }
};