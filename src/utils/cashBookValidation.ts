export function validateCashBook(
  name: string,
  owner: string,
  openingBalance: number
): string | null {

  if (!name.trim()) {
    return "Please enter a Cash Book name.";
  }

  if (name.trim().length < 3) {
    return "Cash Book name should contain at least 3 characters.";
  }

  if (!owner.trim()) {
    return "Please enter the Owner name.";
  }

  if (openingBalance < 0) {
    return "Opening Balance cannot be negative.";
  }

  return null;
}