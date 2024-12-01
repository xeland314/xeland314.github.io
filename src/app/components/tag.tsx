import React from "react";

interface TagProps {
  tag: string;
  bgColor?: string;
  textColor?: string;
  darkBgColor?: string;
  darkTextColor?: string;
}

const Tag: React.FC<TagProps> = ({
  tag,
  bgColor,
  textColor,
  darkBgColor,
  darkTextColor,
}) => {
  return (
    <span
      className={`rounded-full px-2 py-1 text-xs ${
        bgColor ? bgColor : "bg-gray-200"
      } ${textColor ? textColor : "text-gray-700"} ${
        darkBgColor ? `dark:${darkBgColor}` : ""
      } ${darkTextColor ? `dark:${darkTextColor}` : ""}`}
    >
      {tag}
    </span>
  );
};

export default Tag;
