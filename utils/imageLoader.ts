export default function imageLoader({
  src,
  width,
}: {
  src: string;
  width: number;
}) {
  // Prod testing on /staging:
  // return `/staging${src}?w=${width}&q=75`;
  const path = src.startsWith("/") ? src : `/${src}`;
  return `${path}?w=${width}&q=75`;
}
