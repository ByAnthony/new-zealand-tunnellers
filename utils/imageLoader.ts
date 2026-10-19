export default function imageLoader({
  src,
  width,
}: {
  src: string;
  width: number;
}) {
  if (process.env.NODE_ENV !== "production") {
    return `${src}?w=${width}&q=75`;
  }
  // prod testing on /staging
  // return `https://nztunnellers.com/staging${src}?w=${width}&q=75`;
  // live prod
  const path = src.startsWith("/") ? src : `/${src}`;
  return `https://www.nztunnellers.com${path}?w=${width}&q=75`;
}
