export default function sleepTime(ms=1000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}