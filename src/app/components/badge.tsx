interface BadgeProps {
  index: number;
  text: string;
}

export default function Badge({ index, text }: BadgeProps) {
  return (
    <span
      key={index}
      className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded"
    >
      {text}
    </span>
  );
}
