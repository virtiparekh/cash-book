import "./Loader.css";

type LoaderProps = {
  text?: string;
};

function Loader({
  text = "Loading...",
}: LoaderProps) {
  return (
    <div className="loader-container">

      <div className="loader-spinner" />

      <span className="loader-text">
        {text}
      </span>

    </div>
  );
}

export default Loader;