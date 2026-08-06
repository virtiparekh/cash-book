import { useCashBook } from "../hooks/useCashBook";

type DashboardPageProps = {
  userEmail: string;
  onLogout: () => void;
};

function DashboardPage({
  userEmail,
  onLogout,
}: DashboardPageProps) {

  const {
    selectedCashBook,
  } = useCashBook();
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "700px",
          padding: "32px",
          border:
            "1px solid #d1d5db",
          borderRadius: "16px",
          textAlign: "center",
        }}
      >
        <h1>
          Family Cash Book
        </h1>

        <h2>
          Cash Book Created Successfully
        </h2>

        <p>
          Logged in as:
        </p>

        <strong>
          {userEmail}
        </strong>

        <p
          style={{
            marginTop: "24px",
          }}
        >
          Current Cash Book
        </p>

        <code>
          {selectedCashBook?.name}
        </code>

        <br />

        <code>
          {selectedCashBook?.id}
        </code>

        <br />

        <code>
          {selectedCashBook?.role}
        </code>

        <p
          style={{
            marginTop:
              "24px",
            lineHeight:
              "1.6",
          }}
        >
          Your cash book is ready.
          Default categories and
          payment modes were created
          automatically.
        </p>

        <button
          type="button"
          onClick={onLogout}
        >
          Logout
        </button>
      </section>
    </main>
  );
}

export default DashboardPage;