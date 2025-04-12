interface BadgeProps {
  index: number;
  text: string;
}

export default function Badge({ index, text }: BadgeProps) {
  return (
    <div key={`${text}-${index}`}>
      <span
        key={`${text}-${index}`}
        className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded"
      >
        {text}
      </span>
    </div>
  );
}
