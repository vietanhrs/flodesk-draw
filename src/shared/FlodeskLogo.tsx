import { Link } from "react-router-dom";

const LOGO_LETTERS = [..."flodesk"];

interface FlodeskLogoProps {
  className?: string;
}

export const FlodeskLogo = ({ className }: FlodeskLogoProps) => {
  const classes = [
    "flodesk-logo font-flodesk-flotesque text-h3 lg:text-lg tracking-wordmark leading-none lowercase no-underline",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Link to="/" aria-label="Flodesk homepage" className={classes}>
      {LOGO_LETTERS.map((letter, index) => (
        <span
          key={`${letter}-${index}`}
          className="flodesk-logo__letter"
          style={{ ["--flodesk-delay" as string]: `${index * 70}ms` }}
        >
          {letter}
        </span>
      ))}
    </Link>
  );
};
