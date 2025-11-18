// Input validation utilities for security

export interface ValidationResult {
  valid: boolean;
  error?: string;
  value?: any;
}

/**
 * Validate task name
 */
export function validateTaskName(name: string | undefined | null): ValidationResult {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Task name is required' };
  }
  
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return { valid: true, value: 'Untitled' }; // Allow empty, default to Untitled
  }
  
  if (trimmed.length > 500) {
    return { valid: false, error: 'Task name must be 500 characters or less' };
  }
  
  return { valid: true, value: trimmed };
}

/**
 * Validate category (rock, pebble, sand)
 */
export function validateCategory(category: string | undefined | null): ValidationResult {
  if (!category || typeof category !== 'string') {
    return { valid: false, error: 'Category is required' };
  }
  
  const validCategories = ['rock', 'pebble', 'sand'];
  if (!validCategories.includes(category.toLowerCase())) {
    return { valid: false, error: `Category must be one of: ${validCategories.join(', ')}` };
  }
  
  return { valid: true, value: category.toLowerCase() };
}

/**
 * Validate hourly rate
 */
export function validateHourlyRate(rate: number | string | undefined | null): ValidationResult {
  if (rate === undefined || rate === null) {
    return { valid: false, error: 'Hourly rate is required' };
  }
  
  const num = typeof rate === 'string' ? parseFloat(rate) : Number(rate);
  
  if (isNaN(num)) {
    return { valid: false, error: 'Hourly rate must be a valid number' };
  }
  
  if (num <= 0) {
    return { valid: false, error: 'Hourly rate must be greater than 0' };
  }
  
  if (num > 1000000) {
    return { valid: false, error: 'Hourly rate must be 1,000,000 or less' };
  }
  
  return { valid: true, value: num };
}

/**
 * Validate money amount
 */
export function validateMoneyAmount(amount: number | string | undefined | null): ValidationResult {
  if (amount === undefined || amount === null) {
    return { valid: false, error: 'Amount is required' };
  }
  
  const num = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
  
  if (isNaN(num)) {
    return { valid: false, error: 'Amount must be a valid number' };
  }
  
  if (num < 0) {
    return { valid: false, error: 'Amount must be positive' };
  }
  
  if (num > 10000000) {
    return { valid: false, error: 'Amount must be 10,000,000 or less' };
  }
  
  return { valid: true, value: Math.round(num * 100) / 100 }; // Round to 2 decimals
}

/**
 * Validate duration (in seconds)
 */
export function validateDuration(duration: number | string | undefined | null): ValidationResult {
  if (duration === undefined || duration === null) {
    return { valid: true, value: 0 }; // Default to 0
  }
  
  const num = typeof duration === 'string' ? parseInt(duration, 10) : Number(duration);
  
  if (isNaN(num)) {
    return { valid: false, error: 'Duration must be a valid number' };
  }
  
  if (num < 0) {
    return { valid: false, error: 'Duration must be non-negative' };
  }
  
  return { valid: true, value: Math.floor(num) };
}

/**
 * Validate timestamp (BigInt in milliseconds)
 */
export function validateTimestamp(timestamp: number | string | bigint | undefined | null): ValidationResult {
  if (timestamp === undefined || timestamp === null) {
    return { valid: false, error: 'Timestamp is required' };
  }
  
  let num: number;
  if (typeof timestamp === 'bigint') {
    num = Number(timestamp);
  } else if (typeof timestamp === 'string') {
    num = parseInt(timestamp, 10);
  } else {
    num = Number(timestamp);
  }
  
  if (isNaN(num)) {
    return { valid: false, error: 'Timestamp must be a valid number' };
  }
  
  if (num < 0) {
    return { valid: false, error: 'Timestamp must be positive' };
  }
  
  // Check not too far in future (1 day buffer)
  const maxFuture = Date.now() + (24 * 60 * 60 * 1000);
  if (num > maxFuture) {
    return { valid: false, error: 'Timestamp cannot be more than 1 day in the future' };
  }
  
  return { valid: true, value: BigInt(num) };
}

/**
 * Validate text field with max length
 */
export function validateTextField(
  text: string | undefined | null,
  maxLength: number,
  fieldName: string = 'Text',
  required: boolean = false
): ValidationResult {
  if (text === undefined || text === null || text === '') {
    if (required) {
      return { valid: false, error: `${fieldName} is required` };
    }
    return { valid: true, value: null };
  }
  
  if (typeof text !== 'string') {
    return { valid: false, error: `${fieldName} must be a string` };
  }
  
  const trimmed = text.trim();
  
  if (trimmed.length > maxLength) {
    return { valid: false, error: `${fieldName} must be ${maxLength} characters or less` };
  }
  
  return { valid: true, value: trimmed || null };
}

/**
 * Validate goal motivation (max 200 chars)
 */
export function validateGoalMotivation(motivation: string | undefined | null): ValidationResult {
  return validateTextField(motivation, 200, 'Motivation', false);
}

/**
 * Validate note (max 500 chars)
 */
export function validateNote(note: string | undefined | null): ValidationResult {
  return validateTextField(note, 500, 'Note', false);
}

