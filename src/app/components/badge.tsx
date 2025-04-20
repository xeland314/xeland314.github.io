interface BadgeProps {
  index: number;
  text: string;
}

export default function Badge({ index, text }: BadgeProps) {
  return (
    <div key={`${text}-${index}-1`}>
      <span
        key={`${text}-${index}-2`}
        className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-sm"
      >
        {text}
      </span>
    </div>
  );
}
