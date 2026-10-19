// The app is a linear journey. Moving to a later step slides content
// forward; moving to an earlier one slides it back.
export const JOURNEY_ORDER = ["/", "/resume-analyzer", "/job-matcher", "/skill-gap-analysis"] as const;

function rank(path: string): number {
  if (path === "/") return 0;
  return JOURNEY_ORDER.findIndex((route, index) => index > 0 && path.startsWith(route));
}

export function navDirection(from: string, to: string): string[] | undefined {
  const a = rank(from);
  const b = rank(to);
  if (a === -1 || b === -1 || a === b) return undefined;
  return [b > a ? "nav-forward" : "nav-back"];
}
