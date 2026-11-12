/**
 * Reservation widget settings. A change here applies to both modes: by the day and by the month.
 */
export const reservationConfig = {
  /** Time zone used for "now". */
  timeZone: "Europe/Warsaw",
  /**
   * How many minutes after the current moment the earliest pickup slot may appear.
   * 0 means the first slot later than the current minute. With 30-minute slots,
   * 30 puts the first pickup 30 to 60 minutes ahead.
   * Enforced when a time is chosen (calendar, "Szukaj", restored search); a booking
   * already in progress is not cut off by it, see `bookingInProgressStart`.
   */
  pickupLeadMinutes: 30,
  /** Hour list step. 15 yields 00:00, 00:15, 00:30. 30 yields 00:00, 00:30. */
  slotMinutes: 30,
  /**
   * When true, the bar opens with a pickup date and time already filled in.
   * The time is the earliest generated slot after `pickupLeadMinutes`.
   * When false, the pickup field stays empty.
   */
  prefillDates: true,
  /**
   * Default rental length in days, added to the pickup date.
   * Daily rental only. Monthly rental has no return date; it still uses the same pickup start.
   * The return time stays on the same generated slot as pickup.
   */
  defaultRentalDays: 2,
  /** How many months the short-term calendar shows at once. */
  shortTermCalendarMonths: {
    mobile: 5,
    desktop: 2,
  },
  /** Month counts offered for monthly rental. */
  longTermMonthCounts: [1, 2, 3, 4, 5, 6, 12, 24, 36],
  /** Kilometer limits offered for monthly rental. */
  kilometerLimits: [1000, 2000, 3000, 4000, 5000, 6000],
} as const;
