export function unixTimeToHumanReadable(unixTimestamp: number): string {
  const date = new Date(unixTimestamp * 1000);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function daysUntilCycleEnds(cycleEndDate: number): number {
  const now = new Date();
  const endDate = cycleEndDate * 1000;
  const differenceInTime = endDate - now.getTime();
  const differenceInDays = Math.floor(differenceInTime / (1000 * 60 * 60 * 24));
  return differenceInDays < 0 ? 0 : differenceInDays;
}

export const UPGRADE_LINK = "https://trypear.ai/pricing"; 