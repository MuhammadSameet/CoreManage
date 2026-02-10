export const getMonthDates = (dateStr: string) => {
  const date = new Date(dateStr);

  return {
    startDate: new Date(
      date.getFullYear(),
      date.getMonth(),
      1
    ).toISOString(),

    endDate: new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0
    ).toISOString(),
  };
};
