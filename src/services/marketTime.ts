/**
 * Checks if the Indian stock market (NSE/BSE) is currently open.
 * Trading hours are 9:15 AM to 3:30 PM IST, Monday to Friday.
 * Note: This does not account for public holidays.
 */
export const isIndianMarketOpen = (): boolean => {
  // Get the current date and time in the IST timezone (Asia/Kolkata)
  const now = new Date();
  const istTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));

  const day = istTime.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
  const hours = istTime.getHours();
  const minutes = istTime.getMinutes();

  // Check if it's a weekday (Monday to Friday)
  const isWeekday = day >= 1 && day <= 5;

  if (!isWeekday) {
    return false;
  }

  // Check if the time is within market hours (9:15 AM to 3:30 PM)
  const isAfterOpen = hours > 9 || (hours === 9 && minutes >= 15);
  const isBeforeClose = hours < 15 || (hours === 15 && minutes < 30);

  return isAfterOpen && isBeforeClose;
};
