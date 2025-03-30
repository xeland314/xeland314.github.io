import Link from "next/link";

export function CardHeader({ title, link }: { title: string; link: string }) {
  const projectLink = `/projects/${title.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <h3 className="text-xl font-bold mb-2">
      <Link href={link} className="hover:text-blue-700">
        {title}
      </Link>
    </h3>
  );
}
