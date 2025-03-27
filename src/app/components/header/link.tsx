interface LinkProps {
  href: string;
  className?: string;
  onClick?: () => void;
}

export default function HeaderLink({
  href,
  className,
  onClick,
  children,
}: LinkProps & { children: React.ReactNode }) {
  return (
    <a href={href} onClick={onClick} className={className}>
      <li
        className={`max-md:w-full md:basis-1/8 text-center block p-2 md:py-0 transition duration-300 ease-in-out hover:text-blue-700`}
      >
        {children}
      </li>
    </a>
  );
}
