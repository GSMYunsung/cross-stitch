import { COMMIT_RANGE } from "../constant";

export const getRelativeDate = (date: Date, shiftDate: number): Date => {
  date.setDate(date.getDate() + shiftDate);
  return date;
};
