export function calculateCharges(amount: number): number {
    if (amount <= 5000) {
        return 10;
    } else if (amount <= 50000) {
        return 25;
    } else {
        return 50;
    }
}