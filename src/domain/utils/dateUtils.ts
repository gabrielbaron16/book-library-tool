export class DateUtils {
    static getDaysDifference(targetDate: Date): number {
        const today = new Date();

        today.setHours(0, 0, 0, 0);
        targetDate.setHours(0, 0, 0, 0);

        const diffTime = today.getTime() - targetDate.getTime();
        return Math.round(diffTime / (1000 * 60 * 60 * 24));
    }
}