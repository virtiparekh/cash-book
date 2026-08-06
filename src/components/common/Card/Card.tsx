import "./Card.css";

type CardProps = {
  children: React.ReactNode;
  clickable?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
};

function Card({
  children,
  clickable = false,
  className = "",
  style,
  onClick,
}: CardProps) {
  const classes = [
    "app-card",
    clickable ? "app-card--clickable" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={classes}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export default Card;