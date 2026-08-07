export function validateTransaction(

    amount: string,

    categoryId: string,

    paymentModeId: string

): string | null {

    if (!amount) {
        return "Enter amount.";
    }

    if (Number(amount) <= 0) {
        return "Amount must be greater than zero.";
    }

    if (!categoryId) {
        return "Select a category.";
    }

    if (!paymentModeId) {
        return "Select a payment mode.";
    }

    return null;

}